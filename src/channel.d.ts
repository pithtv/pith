import {Pith} from "./pith";

export interface IChannelItem {
    readonly id: string;
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
