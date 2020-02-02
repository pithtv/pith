import {Pith} from "./pith";
import {IStream} from './stream';

export interface IChannelItem {
    creationTime?: Date;
    modificationTime?: Date;
    type: 'container' | 'file';
    readonly id: string;
    title: string;
    genre?: string;
    mimetype?: string;
    playable: boolean;
    fileSize?: number;
}

export interface IPlayState {
    status: "watched"|"inprogress";
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
