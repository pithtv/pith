export interface IChannelItem {
  readonly id: string;
  readonly parentId?: string;

  mediatype?: 'movie' | 'show' | 'episode' | 'season';

  creationTime?: Date;
  modificationTime?: Date;

  type: 'container' | 'file';

  title: string;
  overview?: string;
  tagline?: string;
  genres?: string[];
  mimetype?: string;
  playable?: boolean;
  fileSize?: number;
  dateScanned?: Date;
  unavailable?: boolean;
  banners?: Image[];
  posters?: Image[];
  backdrops?: Image[];
  rating?: number;
  runtime?: number;

  writers?: string[];
  director?: string;
  actors?: string[];
  plot?: string;

  hasNew?: boolean;

  tmdbRating?: number;
  tmdbVoteCount?: number;

  imdbId?: string;

  subtitles?: Subtitle[];
  playState?: IPlayState;
  releaseDate?: Date;

  preferredView?: string
}

export interface Image {
  url: string;
  width?: number;
  height?: number;
  language?: string;
}

export interface Subtitle {
  uri: string,
  mimetype: string,
  language?: string
}

export interface IMediaChannelItem extends IChannelItem {
  type: 'file';
  mediatype: 'episode' | 'movie';
}

export interface IMovieChannelItem extends IMediaChannelItem {
  mediatype: 'movie'
}

export interface IContainerChannelItem extends IChannelItem {
  type: 'container';
  mediatype?: 'season' | 'show';
  sortableFields?: (keyof IChannelItem)[]
}

export interface ITvShow extends IContainerChannelItem {
  noEpisodes?: number;
  noSeasons?: number;
  seasons?: ITvShowSeason[];
  mediatype: 'show'
}

export interface ITvShowSeason extends IContainerChannelItem {
  season: number;
  noEpisodes?: number;
  showname?: string;
  episodes?: ITvShowEpisode[];
  mediatype: 'season'
}

export interface ITvShowEpisode extends IMediaChannelItem {
  showname?: string;
  season: number;
  episode: number;
  mediatype: 'episode',
  releaseDate: Date
}

export interface IPlayState {
  id?: string,
  time?: number,
  duration?: number,
  status: "watched" | "inprogress" | "none",
  updated?: Date;
}
