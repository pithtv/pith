import {Channel} from '../../lib/channel';
import {Pith} from '../../pith';
import {SettingsStoreSymbol} from '../../settings/SettingsStore';
import {container} from 'tsyringe';
import {PithPlugin, plugin} from '../plugins';
import {getLogger} from "log4js";
import {MediaCover, MediaCoverTypes, MovieResource, MovieService, OpenAPI} from "./client";
import {FilesChannel} from "../files/FilesChannel";
import {mapPath} from "../../lib/PathMapper";
import mimetypes from "../../lib/mimetypes";
import {SharedRibbons} from "../../ribbon";
import {Accessor, compare, reverse} from "../../lib/Arrays";
import {IChannelItem, IMediaChannelItem, IPlayState, PathMappings, Ribbon} from "@pithmediaserver/api";
import {StreamDescriptor} from "@pithmediaserver/api/types/stream";

const logger = getLogger('pith.plugin.radarr');
const settingsStore = container.resolve(SettingsStoreSymbol);

interface IFilesChannelItem extends IMediaChannelItem {
  file: string
}

class RadarrChannel extends Channel {
  constructor(private pith: Pith, private url: string, private apikey: string, private pathMapping: PathMappings) {
    super();
    OpenAPI.BASE = url;
    OpenAPI.HEADERS = {"X-Api-Key": apikey};
  }

  async getItem(itemId: string, detailed?: boolean): Promise<IFilesChannelItem> {
    if (!itemId) {
      return {} as IFilesChannelItem;
    }
    const [type, id] = itemId.split('.');
    switch (type) {
      case "movie":
        if (!id) {
          return {} as IFilesChannelItem;
        }
        return this.getMovie(id);
    }
  }

  async getLastPlayState(itemId: string): Promise<IPlayState> {
    return this.getDelegateChannelInstance().getLastPlayState(this.resolveDelegateFileId(await this.getItem(itemId)));
  }

  async getLastPlayStateFromItem(item: IFilesChannelItem): Promise<IPlayState> {
    return this.getDelegateChannelInstance().getLastPlayState(this.resolveDelegateFileId(item));
  }

  async getStream(item: IFilesChannelItem, opts?: any): Promise<StreamDescriptor> {
    const fileId = this.resolveDelegateFileId(item);
    return this.getDelegateChannelInstance().getStream(await this.getDelegateChannelInstance().getItem(fileId), opts);
  }

  private resolveDelegateFileId(item: IFilesChannelItem) {
    const filesChannel = this.getDelegateChannelInstance();
    const fileId = filesChannel.resolveFileId(mapPath(item.file, this.pathMapping));
    return fileId;
  }

  private getDelegateChannelInstance() {
    return this.pith.getChannelInstance('files') as FilesChannel;
  }

  async listContents(containerId?: string): Promise<IMediaChannelItem[]> {
    const movies = await MovieService.getApiV3Movie();
    return movies.map(movie => this.convertMovie(movie));
  }

  private convertMovie(movie: MovieResource) {
    return {
      id: `movie.${movie.id}`,
      title: movie.title,
      type: "file",
      year: movie.year,
      mediatype: 'movie',
      banner: this.resolveImage(movie, MediaCoverTypes.BANNER),
      poster: this.resolveImage(movie, MediaCoverTypes.POSTER),
      backdrop: this.resolveImage(movie, MediaCoverTypes.FANART),
      banners: this.resolveImages(movie, MediaCoverTypes.BANNER),
      posters: this.resolveImages(movie, MediaCoverTypes.POSTER),
      backdrops: this.resolveImages(movie, MediaCoverTypes.FANART),
      dateScanned: new Date(movie.movieFile?.dateAdded),
      releaseDate: new Date(movie.inCinemas),
      overview: movie.overview,
      rating: movie.ratings.imdb?.value,
      imdbId: movie.imdbId,
      tmdbId: movie.tmdbId,
      playable: movie.movieFile !== undefined,
      file: movie.movieFile?.path,
      mimetype: movie.movieFile && mimetypes.fromFilePath(movie.movieFile.path)
    } as IMediaChannelItem & IFilesChannelItem;
  }

  private resolveImage(movie: MovieResource, type: MediaCoverTypes) {
    const image = movie.images.find(i => i.coverType === type);
    if (!image) {
      return undefined;
    }
    return this.resolveImageUrl(image);
  }

  private resolveImageUrl(image: MediaCover) {
    const [, movieId, fileName] = image.url.match(/.*MediaCover\/([0-9]*)\/([^?]*)/) ?? [];
    if (movieId && fileName) {
      return new URL(`api/v3/mediacover/${movieId}/${fileName}?apikey=${this.apikey}`, this.url).toString();
    }
    // fallback if local image resolution isn't working
    return image.remoteUrl;
  }

  private resolveImages(movie: MovieResource, type: MediaCoverTypes) {
    const images = movie.images.filter(i => i.coverType === type);
    return images.map(mc => ({ url: this.resolveImageUrl(mc) }))
  }

  async putPlayState(itemId: string, state: IPlayState): Promise<void> {
    return this.getDelegateChannelInstance().putPlayState(this.resolveDelegateFileId(await this.getItem(itemId)), state);
  }

  private async getMovie(id: string): Promise<IMediaChannelItem & IFilesChannelItem> {
    const radarrMovie = await MovieService.getApiV3Movie1(parseInt(id, 10));
    return this.convertMovie(radarrMovie);
  }

  async getRibbons(): Promise<Ribbon[]> {
    return [SharedRibbons.recentlyAdded, SharedRibbons.recentlyReleased];
  }

  async listContentsOrderedAndPartial(orderBy: Accessor<MovieResource>, maximum: number) {
    const movies = (await MovieService.getApiV3Movie()).filter(m => m.hasFile);
    movies.sort(reverse(compare(orderBy)));
    return movies.slice(0, maximum).map(movie => this.convertMovie(movie));
  }

  async listRibbonContents(ribbonId: string, maximum: number): Promise<IMediaChannelItem[]> {
    switch (ribbonId) {
      case SharedRibbons.recentlyAdded.id:
        return this.listContentsOrderedAndPartial(m => m.movieFile?.dateAdded ?? 0, maximum);
      case SharedRibbons.recentlyReleased.id:
        return this.listContentsOrderedAndPartial(m => m.inCinemas, maximum);
      case SharedRibbons.continueWatching.id:
        return (await this.listContents()).filter(m => m.playState?.status === "inprogress").sort(reverse(compare(i => i.playState.updated)));
    }
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
        init(pluginOpts) {
          return new RadarrChannel(pluginOpts.pith, pluginSettings.url, pluginSettings.apikey, pluginSettings.pathMapping);
        }
      });
    }
  };
}
