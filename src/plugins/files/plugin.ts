import {promises as fs} from 'fs';
import mimetypes from '../../lib/mimetypes';

import vidstreamer from '../../lib/vidstreamer';
import $path from 'path';
import {StateStore} from './playstate';
import ff from 'fluent-ffmpeg';
import {Channel} from '../../lib/channel';
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
import {SettingsStore, SettingsStoreSymbol} from '../../settings/SettingsStore';
import {inject, injectable} from 'tsyringe';
import {DBDriver, DBDriverSymbol} from '../../persistence/DBDriver';
import {PithPlugin, plugin} from '../plugins';
import {MetaDataProvider} from './MetaDataProvider';

export const metaDataProviders : MetaDataProvider[] = [new movie_nfo(), new tvshow_nfo(), new thumbnails(), new fanart()];

export class FilesChannel extends Channel {
    private rootDir: string;

    constructor(private pith: Pith, private statestore: StateStore, private settingsStore: SettingsStore) {
        super();

        this.rootDir = settingsStore.settings.files.rootDir;
        this.pith = pith;

        const channel = this;

        vidstreamer.settings({
            getFile: function (path, cb) {
                cb(channel.getFile(path));
            }
        });

        if(pith.handle) {
            pith.handle.use('/stream/:fingerprint', vidstreamer);
            pith.handle.use('/preview', preview(path => this.getFile(path)));
        }
    }

    async listContents(containerId?) {
        const rootDir = this.rootDir;
        let path;
        if (containerId) {
            path = $path.resolve(rootDir, containerId);
        } else {
            path = rootDir;
        }

        const filesChannel = this;

        const files = await fs.readdir(path);
        const filteredFiles = files.filter(e => (e[0] !== '.' || this.settingsStore.settings.files.showHiddenFiles) && this.settingsStore.settings.files.excludeExtensions.indexOf($path.extname(e)) === -1);

        const transformed = await Promise.all(filteredFiles.map(file => {
            const filepath = $path.resolve(path, file);
            const itemId = $path.relative(rootDir, filepath);
            return filesChannel.getItem(itemId, false);
        }));

        return transformed.filter(e => e !== undefined);
    }

    getFile(path) {
        return $path.resolve(this.rootDir, path);
    }

    async getItem(itemId, detailed = true) {
        const filepath = $path.resolve(this.rootDir, itemId);
        const channel = this;
        const stats = await fs.stat(filepath);
        const item: IChannelItem = {
            title: $path.basename(itemId),
            id: itemId,
            ...(stats && stats.isDirectory() ? {
                type: 'container'
            }: {
                type: 'file',
                mimetype: mimetypes.fromFilePath(itemId),
                playable: mimetypes.fromFilePath(itemId) && true,

                fileSize: stats && stats.size,
                modificationTime: stats && stats.mtime,
                creationTime: stats && stats.ctime,
            })
        };

        const applicableProviders = metaDataProviders.filter(f => f.appliesTo(channel, filepath, item));

        if (applicableProviders.length) {
            await Promise.all(applicableProviders.map(provider => provider.get(channel, filepath, item)));
            return item;
        } else {
            return item;
        }
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

@injectable()
@plugin()
export default class FilesPlugin implements PithPlugin {
    constructor(@inject(SettingsStoreSymbol) private settingsStore: SettingsStore,
                @inject(DBDriverSymbol) private dbDriver: DBDriver,
                @inject(StateStore) private stateStore: StateStore) {
    }

    async init(opts) {
        await this.stateStore.init();
        opts.pith.registerChannel({
            id: 'files',
            title: 'Files',
            init: (opts) => {
                return new FilesChannel(opts.pith, this.stateStore, this.settingsStore);
            },
            sequence: 0
        });
    };
}
