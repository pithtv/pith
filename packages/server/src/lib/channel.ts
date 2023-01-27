import {IChannel} from "../channel";
import {RestComponent} from "./restcomponent";
import {IChannelItem, IPlayState} from "@pithmediaserver/api";
import {StreamDescriptor} from "@pithmediaserver/api/types/stream";

export abstract class Channel implements IChannel {
    public id: string;

    public abstract listContents(containerId: string): Promise<IChannelItem[]>;

    public abstract getLastPlayState(itemId: string): Promise<IPlayState>;

    public abstract putPlayState(itemId: string, state: IPlayState): Promise<void>;

    public abstract getItem(itemId: string, detailed?: boolean): Promise<IChannelItem>;

    public abstract getLastPlayStateFromItem(item: IChannelItem): Promise<IPlayState>;

    public abstract getStream(item: IChannelItem, opts?: any): Promise<StreamDescriptor>;
}
