export interface IChannelItem {
  creationTime?: Date;
  modificationTime?: Date;
  type: 'container' | 'file';
  readonly id: string;
  title: string;
  overview?: string;
  genre?: string;
  mimetype?: string;
  playable?: boolean;
  fileSize?: number;
  dateScanned?: Date;
  unavailable?: boolean;
  backdrop?: string;
  poster?: string;
  banner?: string;
  banners?: Image[];
  posters?: Image[];
  backdrops?: Image[];

  [key: string]: any;

  subtitles?: Subtitle[];
  playState?: IPlayState;
  releaseDate?: Date;
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

export interface IContainerChannelItem extends IChannelItem {
  type: 'container';
}

export interface ITvShow extends IContainerChannelItem {
  seasons?: ITvShowSeason[];
}

export interface ITvShowSeason extends IContainerChannelItem {
  episodes?: ITvShowEpisode[];
}

export interface ITvShowEpisode extends IMediaChannelItem {
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
