import {IChannel, IChannelItem} from '../../channel';
import {FilesChannel} from "./plugin";

export interface MetaDataProvider {
    appliesTo(channel: IChannel, filepath: string, item: IChannelItem): boolean;
    get(channel: FilesChannel, filepath: string, item: IChannelItem): Promise<void>;
}
