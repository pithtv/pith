import {Pith} from "./pith";
import {IStream} from './stream';

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
    [key: string]: any;
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
    airDate: Date
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
}
