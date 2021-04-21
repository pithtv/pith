import {Pith} from "./pith";
import {IStream} from './stream';
import {Ribbon} from "./ribbon";

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
    type: 'file'
}

export interface IContainerChannelItem extends IChannelItem {
    type: 'container'
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
    status: "watched"|"inprogress"|"none";
}

export interface IChannelInitialiser {
    readonly id: string;
    readonly sequence?: number;
    readonly title: string;
    init(opts: {pith: Pith}): IChannel;
}

export interface IChannel {
    readonly id: string;
    listContents(containerId: string): IChannelItem[] | Promise<IChannelItem[]>;

    getLastPlayState(itemId: string): Promise<IPlayState>;

    putPlayState(itemId: string, state: IPlayState): Promise<void>;

    getItem(itemId: string): Promise<IChannelItem>;

    getStream(item: IChannelItem, opts?: any): Promise<IStream>;

    getLastPlayState(itemId: string): Promise<IPlayState>;

    getLastPlayStateFromItem(item: IChannelItem): Promise<IPlayState>;

    getRibbons?(): Promise<Ribbon[]>;

    listRibbonContents?(ribbonId: string, maximum: number) : Promise<IMediaChannelItem[]>
}

