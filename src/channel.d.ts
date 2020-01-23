import {Pith} from "./pith";

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
    readonly sequence: number;
    init(opts: {pith: Pith}): IChannel;
}

export interface IChannel {
    readonly id: string;
    listContents(containerId: string): IChannelItem[] | Promise<IChannelItem[]>;

    getLastPlayState(itemId: string): Promise<IPlayState>;

    putPlayState(itemId: string, state: IPlayState): Promise<void>;

    getItem(itemId: string): Promise<IChannelItem>;
}
