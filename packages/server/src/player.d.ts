import {IChannel} from "./channel";
import {EventEmitter} from "events";
import {IChannelItem} from "@pithmediaserver/api";
import {PlayerStatus} from "@pithmediaserver/api/types/player";

export interface Icon {
    type: string
    url: string
    width: number
    height: number
}

export interface IPlayer extends EventEmitter {
    status: PlayerStatus
    id: string
    icons: {[size: string]: Icon}
    friendlyName: string

    load(channel: IChannel, item: IChannelItem): Promise<void>
    play(seekTime?: number): Promise<void>
    stop?(): Promise<void>
    pause?(): Promise<void>
    seek?({time: number}): Promise<void>
}
