import {Channel} from '../../lib/channel';
import {Pith} from '../../pith';
import {IChannelItem, IMediaChannelItem, IPlayState} from '../../channel';
import {SettingsStoreSymbol} from '../../settings/SettingsStore';
import {container} from 'tsyringe';
import {PithPlugin, plugin} from '../plugins';
import {getLogger} from "log4js";
import {IStream} from "../../stream";
import {MediaCoverTypes, MovieResource, MovieService, OpenAPI} from "./client";
import {FilesChannel} from "../files/plugin";

const logger = getLogger('pith.plugin.radarr');
const settingsStore = container.resolve(SettingsStoreSymbol);

class RadarrChannel extends Channel {
  constructor(private pith: Pith, private url: string, private apikey: string) {
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

  getLastPlayState(itemId: string): Promise<IPlayState> {
    return Promise.resolve(undefined);
  }

  getLastPlayStateFromItem(item: IChannelItem): Promise<IPlayState> {
    return Promise.resolve(undefined);
  }

  async getStream(item: IChannelItem, opts?: any): Promise<IStream> {
    let filesChannel = this.pith.getChannelInstance('files') as FilesChannel;
    let file = await filesChannel.resolveFile(item._file);
    return filesChannel.getStream(item._file, opts);
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

  putPlayState(itemId: string, state: IPlayState): Promise<void> {
    return Promise.resolve(undefined);
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
          return new RadarrChannel(opts.pith, pluginSettings.url, pluginSettings.apikey);
        }
      });
    }
  };
}
