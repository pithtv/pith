import {IChannel} from "./channel";
import {EventEmitter} from "events";
import {IChannelItem} from "@pithmediaserver/api";

export interface Icon {
    type: string,
    url: string,
    width: number,
    height: number
}

export interface IPlayerStatus {
    position?: {time: number, title?: string, uri?: string, duration?: number};
    serverTimestamp?: number;
    state?: {playing?: boolean};
    actions?: {stop?: boolean, seek?: boolean, play?: boolean, pause?: boolean}
}

export interface IPlayer extends EventEmitter {
    status: IPlayerStatus;
    id: string;
    icons: {[size: string]: Icon};

    load(channel: IChannel, item: IChannelItem): Promise<void>;
    play(seekTime?: number): Promise<void>;
    stop?(): Promise<void>
    pause?(): Promise<void>
    seek?({time: number}): Promise<void>
}
