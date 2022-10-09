import {IChannel, IChannelItem} from "./channel";
import {EventEmitter} from "events";

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
}
