import {IMediaChannelItem} from "./media";

export interface Ribbon {
  id: string;
  name: string;
}

export interface RibbonItem {
  channelId: string;
  item: IMediaChannelItem;
}

