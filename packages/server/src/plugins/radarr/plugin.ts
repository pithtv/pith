import {Channel} from '../../lib/channel';
import {Pith} from '../../pith';
import {IChannelItem, IMediaChannelItem, IPlayState} from '../../channel';
import {SettingsStoreSymbol} from '../../settings/SettingsStore';
import {container} from 'tsyringe';
import {PithPlugin, plugin} from '../plugins';
import {getLogger} from "log4js";
import {IStream} from "../../stream";
import {MediaCoverTypes, MovieResource, MovieService, OpenAPI} from "./client";
import {FilesChannel} from "../files/FilesChannel";
import {PathMappings} from "../../settings/Settings";
import {mapPath} from "../../lib/PathMapper";

const logger = getLogger('pith.plugin.radarr');
const settingsStore = container.resolve(SettingsStoreSymbol);

class RadarrChannel extends Channel {
  constructor(private pith: Pith, private url: string, private apikey: string, private pathMapping: PathMappings) {
    super();
    OpenAPI.BASE = url;
    OpenAPI.HEADERS = {"X-Api-Key": apikey};
  }

  async getItem(itemId: string, detailed?: boolean): Promise<IChannelItem> {
    if(!itemId) {
      return {} as IChannelItem;
    }
    const [type,id] = itemId.split('.');
    switch(type) {
      case "movie":
        if(!id) return {} as IChannelItem;
        return this.getMovie(id);
    }
  }

  async getLastPlayState(itemId: string): Promise<IPlayState> {
    return this.getDelegateChannelInstance().getLastPlayState(this.resolveDelegateFileId(await this.getItem(itemId)));
  }

  async getLastPlayStateFromItem(item: IChannelItem): Promise<IPlayState> {
    return this.getDelegateChannelInstance().getLastPlayState(this.resolveDelegateFileId(item));
  }

  async getStream(item: IChannelItem, opts?: any): Promise<IStream> {
    let fileId = this.resolveDelegateFileId(item);
    return this.getDelegateChannelInstance().getStream(await this.getDelegateChannelInstance().getItem(fileId), opts);
  }

  private resolveDelegateFileId(item: IChannelItem) {
    let filesChannel = this.getDelegateChannelInstance();
    let fileId = filesChannel.resolveFileId(mapPath(item._file, this.pathMapping));
    return fileId;
  }

  private getDelegateChannelInstance() {
    return this.pith.getChannelInstance('files') as FilesChannel;
  }

  async listContents(containerId: string): Promise<IChannelItem[]> {
    const movies = await MovieService.getApiV3Movie();
    return movies.map(movie => this.convertMovie(movie));
  }

  private convertMovie(movie: MovieResource) {
    return <IMediaChannelItem>{
      id: `movie.${movie.id}`,
      title: movie.title,
      type: "file",
      year: movie.year,
      banner: this.resolveImage(movie, MediaCoverTypes.BANNER),
      poster: this.resolveImage(movie, MediaCoverTypes.POSTER),
      backdrop: this.resolveImage(movie, MediaCoverTypes.FANART),
      dateScanned: new Date(movie.movieFile?.dateAdded),
      overview: movie.overview,
      rating: movie.ratings.imdb?.value,
      imdbId: movie.imdbId,
      tmdbId: movie.tmdbId,
      playable: movie.movieFile !== undefined,
      _file: movie.movieFile?.path
    };
  }

  private resolveImage(movie: MovieResource, type: MediaCoverTypes) {
    let image = movie.images.find(i => i.coverType === type);
    if (!image) {
      return undefined;
    }
    const [,movieId,fileName] = image.url.match(/.*MediaCover\/([0-9]*)\/([^?]*)/) ?? [];
    if(movieId && fileName) {
      return new URL(`api/v3/mediacover/${movieId}/${fileName}?apikey=${this.apikey}`, this.url).toString();
    }
    // fallback if local image resolution isn't working
    return image.remoteUrl;
  }

  async putPlayState(itemId: string, state: IPlayState): Promise<void> {
    return this.getDelegateChannelInstance().putPlayState(this.resolveDelegateFileId(await this.getItem(itemId)), state);
  }

  private async getMovie(id: string): Promise<IMediaChannelItem> {
    const radarrMovie = await MovieService.getApiV3Movie1(parseInt(id));
    return this.convertMovie(radarrMovie);
  }
}

@plugin()
export default class SonarrPlugin implements PithPlugin {
  init(opts) {
    const pluginSettings = settingsStore.settings.radarr;
    if (pluginSettings && pluginSettings.enabled && pluginSettings.url) {
      opts.pith.registerChannel({
        id: 'radarr',
        title: 'radarr',
        init(opts) {
          return new RadarrChannel(opts.pith, pluginSettings.url, pluginSettings.apikey, pluginSettings.pathMapping);
        }
      });
    }
  };
}
