import {IChannel, IChannelItem} from '../../channel';

export interface MetaDataProvider {
    appliesTo(channel: IChannel, filepath: string, item: IChannelItem): boolean;
    get(channel: IChannel, filepath: string, item: IChannelItem): Promise<void>;
}
