import fs from 'fs';
import mimetypes from '../../lib/mimetypes';

import vidstreamer from '../../lib/vidstreamer';
import async from 'async';
import $path from 'path';
import {playstate} from './playstate';
import ff from 'fluent-ffmpeg';
import {Channel} from '../../lib/channel';
import {wrap as wrapToPromise} from '../../lib/async';
import profiles from '../../lib/profiles';
import {keyframes} from '../../lib/keyframes';
import {preview} from './preview';
import movie_nfo from './movie-nfo';
import tvshow_nfo from './tvshow-nfo';
import thumbnails from './thumbnails';
import fanart from './fanart';
import {Pith} from '../../pith';
import {IChannelItem} from '../../channel';
import {IStream} from '../../stream';
import {SettingsStoreSymbol} from '../../settings/SettingsStore';
import {container} from 'tsyringe';

const settingsStore = container.resolve(SettingsStoreSymbol);

export const metaDataProviders = [new movie_nfo(), new tvshow_nfo(), new thumbnails(), new fanart()];

export class FilesChannel extends Channel {
    private rootDir: string;
    private pith: Pith;
    private statestore: any;

    constructor(pith: Pith, statestore) {
        super();

        this.rootDir = settingsStore.settings.files.rootDir;
        this.pith = pith;

        const channel = this;

        this.statestore = statestore;

        vidstreamer.settings({
            getFile: function (path, cb) {
                cb(channel.getFile(path));
            }
        });

        pith.handle.use('/stream/:fingerprint', vidstreamer);
        pith.handle.use('/preview', preview(path => this.getFile(path)));
    }

    listContents(containerId) {
        return wrapToPromise<IChannelItem[]>(cb => {
            const rootDir = this.rootDir;
            let path;
            if (containerId) {
                path = $path.resolve(rootDir, containerId);
            } else {
                path = rootDir;
            }

            const filesChannel = this;

            fs.readdir(path, function (err, files) {
                if (err) {
                    cb(err);
                } else {
                    const filteredFiles = files.filter(e => (e[0] !== '.' || settingsStore.settings.files.showHiddenFiles) && settingsStore.settings.files.excludeExtensions.indexOf($path.extname(e)) === -1);
                    Promise.all(filteredFiles.map(file => {
                        const filepath = $path.resolve(path, file);
                        const itemId = $path.relative(rootDir, filepath);
                        return filesChannel.getItem(itemId, false);
                    })).then(items => {
                        cb(false, items.filter(e => e !== undefined));
                    }).catch(err => {
                        cb(err);
                    });
                }
            });
        });
    }

    getFile(path) {
        return $path.resolve(this.rootDir, path);
    }

    getItem(itemId, detailed = true) {
        return new Promise((resolve) => {
            const filepath = $path.resolve(this.rootDir, itemId);
            const channel = this;
            fs.stat(filepath, function (err, stats) {
                const item: Partial<IChannelItem> = {
                    title: $path.basename(itemId),
                    id: itemId
                };

                if (stats && stats.isDirectory()) {
                    item.type = 'container';
                } else {
                    item.type = 'file';
                    item.mimetype = mimetypes.fromFilePath(itemId);
                    item.playable = item.mimetype && true;

                    item.fileSize = stats && stats.size;
                    item.modificationTime = stats && stats.mtime;
                    item.creationTime = stats && stats.ctime;
                }

                const applicableProviders = metaDataProviders.filter(function (f) {
                    return f.appliesTo(channel, filepath, item);
                });

                if (applicableProviders.length) {
                    async.parallel(applicableProviders.map(function (f) {
                        return function (cb) {
                            f.get(channel, filepath, item, cb);
                        };
                    }), function () {
                        resolve(item as IChannelItem);
                    });
                } else {
                    resolve(item as IChannelItem);
                }
            });
        }) as Promise<IChannelItem>;
    }

    getStream(item, options) {
        return new Promise((resolve, reject) => {
            const channel = this;
            const itemId = item.id;
            const itemPath = itemId.split($path.sep).map(encodeURIComponent).join('/');
            ff.ffprobe(this.getFile(item.id), (err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    let duration = parseFloat(metadata.format.duration) * 1000;

                    const baseUrl = `${channel.pith.rootUrl}stream/${encodeURIComponent(options && options.fingerprint) || '0'}/${itemPath}`;

                    const desc = {
                        url: baseUrl,
                        mimetype: item.mimetype || 'application/octet-stream',
                        seekable: true,
                        format: {
                            container: metadata.format.tags ? metadata.format.tags.major_brand : 'unknown',
                            streams: metadata.streams.map(stream => ({
                                index: stream.index,
                                codec: stream.codec_name,
                                profile: stream.profile,
                                pixelFormat: stream.pix_fmt
                            }))
                        },
                        duration: duration,
                        streams: [],
                        keyframes: []
                    };

                    if (options && options.target) {
                        desc.streams = options.target.split(',').map((profileName) => {
                            let profile = profiles[profileName];
                            let url = `${baseUrl}?transcode=${profileName}`;
                            if (profile.requiresPlaylist) {
                                url += `&playlist=${profile.requiresPlaylist}`;
                            }

                            return {
                                url: url,
                                mimetype: profile.mimetype,
                                seekable: profile.seekable,
                                duration: duration
                            };
                        });
                    }

                    if (options && options.includeKeyFrames) {
                        keyframes(this.getFile(item.id), metadata).then(frames => {
                            desc.keyframes = frames;
                            resolve(desc);
                        }).catch(() => {
                            resolve(desc);
                        });
                    } else {
                        resolve(desc);
                    }
                }
            });
        }) as Promise<IStream>;
    }

    getLastPlayState(itemId) {
        const state = this.statestore.get(itemId);
        return Promise.resolve(state);
    }

    getLastPlayStateFromItem(item) {
        return this.getLastPlayState(item.id);
    }

    putPlayState(itemId, state) {
        try {
            state.id = itemId;
            this.statestore.put(state);
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    resolveFile(file) {
        if (file.startsWith(this.rootDir)) {
            let relative = file.substring(this.rootDir.length);
            if (relative.startsWith('/')) {
                relative = relative.substring(1);
            }
            return this.getItem(relative);
        } else {
            return Promise.reject('File not contained within media root');
        }
    }
}

export function init(opts) {
    playstate(opts.pith.db, function (err, statestore) {
        opts.pith.registerChannel({
            id: 'files',
            title: 'Files',
            init: function (opts) {
                return new FilesChannel(opts.pith, statestore);
            },
            sequence: 0
        });
    });
};
