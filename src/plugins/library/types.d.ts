import {IChannelItem} from '../../channel';

export namespace MovieLibrary {
    export interface Movie extends IChannelItem {
    }

    export interface Actor extends IChannelItem {
    }

    export interface Director extends IChannelItem {
    }

    export interface Writer extends IChannelItem {
    }

    export interface Keyword extends IChannelItem {
    }

    export interface Genre extends IChannelItem {
    }
}
