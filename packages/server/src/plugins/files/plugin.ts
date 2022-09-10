import {promises as fs} from 'fs';
import mimetypes from '../../lib/mimetypes';

import vidstreamer from '../../lib/vidstreamer';
import $path from 'path';
import {StateStore} from './playstate';
import ff, {FfprobeData} from 'fluent-ffmpeg';
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
import {wrap} from "../../lib/async";
import {Subtitles} from "./subtitles";
import * as path from "path";

export const metaDataProviders: MetaDataProvider[] = [new movie_nfo(), new tvshow_nfo(), new thumbnails(), new fanart(), new Subtitles()];

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

        if (pith.handle) {
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
                type: 'container',
                preferredView: 'details'
            } : {
                type: 'file',
                mimetype: mimetypes.fromFilePath(itemId),
                playable: mimetypes.fromFilePath(itemId)?.match(/^(video|audio|image)\//) !== null ?? false,

                fileSize: stats && stats.size,
                modificationTime: stats && stats.mtime,
                creationTime: stats && stats.ctime,
            }),
            playState: await this.getLastPlayState(itemId)
        };

        const applicableProviders = metaDataProviders.filter(f => f.appliesTo(channel, filepath, item));

        if (applicableProviders.length) {
            await Promise.all(applicableProviders.map(provider => provider.get(channel, filepath, item)));
        }
        return item;
    }

    async getStream(item, options?): Promise<IStream> {
        const channel = this;
        const itemId = item.id;
        const itemPath = itemId.split($path.sep).map(encodeURIComponent).join('/');
        const metadata = await wrap<FfprobeData>(cb => ff.ffprobe(this.getFile(item.id), cb));
        let duration = metadata.format.duration * 1000;

        const baseUrl = `${channel.pith.rootUrl}stream/${encodeURIComponent(options && options.fingerprint) || '0'}/${itemPath}`;

        const desc: IStream = {
            url: baseUrl,
            mimetype: item.mimetype || 'application/octet-stream',
            seekable: true,
            format: {
                container: metadata.format.tags ? (metadata.format.tags as any).major_brand : 'unknown',
                streams: metadata.streams.filter(stream => stream.disposition.attached_pic === 0 && stream.disposition.timed_thumbnails === 0).map(stream => ({
                    index: stream.index,
                    type: stream.codec_type,
                    codec: stream.codec_name,
                    profile: stream.profile as unknown as string,
                    pixelFormat: stream.pix_fmt,
                    channels: stream.channels as unknown as string,
                    layout: stream.channel_layout,
                    language: stream.tags?.language,
                    resolution: stream.codec_type === 'video' ? { width: stream.width, height: stream.height }: undefined
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
            try {
                const frames = await keyframes(this.getFile(item.id), metadata);
                desc.keyframes = frames;
                return desc;
            } catch (e) {
                return desc;
            }
        } else {
            return desc;
        }
    }

    makeUrlForFile(file: string, options?) {
        return `${this.pith.rootUrl}stream/${encodeURIComponent(options?.fingerprint ?? '0')}/${encodeURI(path.relative(this.rootDir, file))}`;
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

    resolveFileId(file: string) {
        if (file.startsWith(this.rootDir)) {
            let relative = file.substring(this.rootDir.length);
            if (relative.startsWith('/')) {
                relative = relative.substring(1);
            }
            return relative;
        } else {
            return Promise.reject('File not contained within media root');
        }
    }

    resolveFile(file: string) {
        return this.getItem(this.resolveFileId(file));
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
            init: () => {
                return new FilesChannel(opts.pith, this.stateStore, this.settingsStore);
            },
            sequence: 0
        });
    }
}
