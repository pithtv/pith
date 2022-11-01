import {IChannel} from '../../channel';
import {FilesChannel} from "./FilesChannel";
import {IChannelItem} from "@pithmediaserver/api";

export interface MetaDataProvider {
    appliesTo(channel: IChannel, filepath: string, item: IChannelItem): boolean;
    get(channel: FilesChannel, filepath: string, item: IChannelItem): Promise<void>;
}
