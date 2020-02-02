import {IChannel, IChannelItem} from "./channel";
import {IEventEmitter} from "./lib/events";

export interface Icon {
    type: string,
    url: string,
    width: number,
    height: number
}

export interface IPlayerStatus {
    position?: {time: number};
    serverTimestamp?: number;
    state?: {playing?: boolean};
    actions?: {stop?: boolean, seek?: boolean, play?: boolean, pause?: boolean}
}

export interface IPlayer extends IEventEmitter {
    status: IPlayerStatus;
    id: string;
    icons: {[size: string]: Icon};

    load(channel: IChannel, item: IChannelItem): Promise<void>;
    play(seekTime?: number): Promise<void>;
}
