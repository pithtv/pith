import {Channel} from "../../lib/channel";
import {Pith} from "../../pith";
import {IStateStore} from "./playstate";
import {SettingsStore} from "../../settings/SettingsStore";
import vidstreamer from "../../lib/vidstreamer";
import {preview} from "./preview";
import $path from "path";
import path from "path";
import {promises as fs} from "fs";
import {IChannelItem} from "../../channel";
import mimetypes from "../../lib/mimetypes";
import {IStream} from "../../stream";
import {wrap} from "../../lib/async";
import profiles from "../../lib/profiles";
import {keyframes} from "../../lib/keyframes";
import ff, {FfprobeData} from 'fluent-ffmpeg';
import {metaDataProviders} from "./metaDataProviders";

export class FilesChannel extends Channel {
  private rootDir: string;

  constructor(private pith: Pith, private statestore: IStateStore, private settingsStore: SettingsStore) {
    super();

    this.rootDir = settingsStore.settings.files.rootDir;
    this.pith = pith;

    const channel = this;

    vidstreamer.settings({
      getFile(p, cb) {
        cb(channel.getFile(p));
      }
    });

    if (pith.handle) {
      pith.handle.use('/stream/:fingerprint', vidstreamer);
      pith.handle.use('/preview', preview(p => this.getFile(p)));
    }
  }

  async listContents(containerId?) {
    const rootDir = this.rootDir;
    let p;
    if (containerId) {
      p = $path.resolve(rootDir, containerId);
    } else {
      p = rootDir;
    }

    const filesChannel = this;

    const files = await fs.readdir(p);
    const filteredFiles = files.filter(e => (e[0] !== '.' || this.settingsStore.settings.files.showHiddenFiles) && this.settingsStore.settings.files.excludeExtensions.indexOf($path.extname(e)) === -1);

    const transformed = await Promise.all(filteredFiles.map(file => {
      const filepath = $path.resolve(p, file);
      const itemId = $path.relative(rootDir, filepath);
      return filesChannel.getItem(itemId, false);
    }));

    return transformed.filter(e => e !== undefined);
  }

  private getFile(targetPath: string) {
    return $path.resolve(this.rootDir, targetPath);
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
    const duration = metadata.format.duration * 1000;

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
          resolution: stream.codec_type === 'video' ? {width: stream.width, height: stream.height} : undefined
        }))
      },
      duration,
      streams: [],
      keyframes: []
    };

    if (options && options.target) {
      desc.streams = options.target.split(',').map((profileName) => {
        const profile = profiles[profileName];
        let url = `${baseUrl}?transcode=${profileName}`;
        if (profile.requiresPlaylist) {
          url += `&playlist=${profile.requiresPlaylist}`;
        }

        return {
          url,
          mimetype: profile.mimetype,
          seekable: profile.seekable,
          duration
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

  putPlayState(itemId, state) : Promise<void> {
    try {
      state.id = itemId;
      this.statestore.put(state);
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  }

  resolveFileId(file: string) : string {
    if (file.startsWith(this.rootDir)) {
      let relative = file.substring(this.rootDir.length);
      if (relative.startsWith('/')) {
        relative = relative.substring(1);
      }
      return relative;
    } else {
      throw new Error('File not contained within media root');
    }
  }

  resolveFile(file: string) : Promise<IChannelItem> {
    return this.getItem(this.resolveFileId(file));
  }
}
