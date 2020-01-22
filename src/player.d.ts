import {IChannel, IChannelItem} from "./channel";
import {IEventEmitter} from "./lib/events";

export interface IPlayerStatus {
    position: {time: number};
    serverTimestamp: number;
    state: {playing: boolean};
}

export interface IPlayer extends IEventEmitter {
    status: IPlayerStatus;
    id: string;

    load(channel: IChannel, item: IChannelItem): Promise<void>;
    play(seekTime?: number): Promise<void>;
}
