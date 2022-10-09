import {IChannel, IChannelItem} from '../../channel';
import {FilesChannel} from "./FilesChannel";

export interface MetaDataProvider {
    appliesTo(channel: IChannel, filepath: string, item: IChannelItem): boolean;
    get(channel: FilesChannel, filepath: string, item: IChannelItem): Promise<void>;
}
