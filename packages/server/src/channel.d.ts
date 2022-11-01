import {Pith} from "./pith";
import {IChannelItem, IMediaChannelItem, IPlayState, Ribbon} from "@pithmediaserver/api";
import {StreamDescriptor} from "@pithmediaserver/api/types/stream";

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

    getStream(item: IChannelItem, opts?: any): Promise<StreamDescriptor>;

    getLastPlayState(itemId: string): Promise<IPlayState>;

    getLastPlayStateFromItem(item: IChannelItem): Promise<IPlayState>;

    getRibbons?(): Promise<Ribbon[]>;

    listRibbonContents?(ribbonId: string, maximum: number) : Promise<IMediaChannelItem[]>
}

