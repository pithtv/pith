import {IChannelItem} from '../../channel';
import {PithPlugin} from "../plugins";
import {Channel} from "../../lib/channel";

export namespace MovieLibrary {
    export interface Movie extends IChannelItem {
    }

    export interface Person extends IChannelItem {
    }

    export interface Keyword extends IChannelItem {
    }

    export interface Genre extends IChannelItem {
    }
}

export type LibraryRoot = {
    id: string
    title: string
    type: "container"|"file"
    description?: string
    visible?: boolean
    sortableFields?: (keyof IChannelItem)[]
    _getContents(itemId: string): Promise<IChannelItem[]>
    _getItem?(itemId: string): Promise<IChannelItem>
}

export type DirectoryFactory = (plugin: Channel) => LibraryRoot[]
