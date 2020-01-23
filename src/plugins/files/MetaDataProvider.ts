import {IChannel, IChannelItem} from '../../channel';
import {Callback} from '../../junk';

export interface MetaDataProvider {
    appliesTo(channel: IChannel, filepath: string, item: IChannelItem): boolean;
    get(channel: IChannel, filepath: string, item: IChannelItem, cb: Callback): void;
}
