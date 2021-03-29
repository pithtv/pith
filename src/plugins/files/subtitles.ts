import {MetaDataProvider} from "./MetaDataProvider";
import {IChannel, IChannelItem} from "../../channel";
import path from "path";
import {promises as fs} from "fs";
import {FilesChannel} from "./plugin";

const extensionMap = {
    srt: "text/srt",
    sub: "text/sub"
}

function extension(filepath: string): string {
    return filepath.substr(filepath.lastIndexOf(".") + 1);
}

function extractLanguage(filepath: string, commonPart: string) : string | undefined {
    const suffix = filepath.replace(commonPart, '');
    const parts = suffix.toLowerCase().split('.');
    parts.pop();
    return parts.find(p => p.match(/[a-z]{2}(-[A-Z]{2})?/));
}

export class Subtitles implements MetaDataProvider {
    appliesTo(channel: IChannel, filepath: string, item: IChannelItem): boolean {
        return item.playable;
    }

    async get(channel: FilesChannel, filepath: string, item: IChannelItem): Promise<void> {
        const parent = path.dirname(filepath);
        const siblings = await fs.readdir(parent);
        const basename = path.basename(filepath);
        const prefix = basename.substr(0, basename.lastIndexOf('.'));
        const candidateSubs = siblings.filter(s => s.startsWith(prefix) && extension(s) in extensionMap);
        if(candidateSubs.length > 0) {
            item.subtitles = [
                ...candidateSubs.map(sub => ({
                    language: extractLanguage(sub, prefix),
                    uri: channel.makeUrlForFile(path.join(parent, sub), item),
                    mimetype: extensionMap[extension(sub)]
                }))
            ]
        }
    }

}
