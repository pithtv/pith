import {MetaDataProvider} from './MetaDataProvider';

import $path from 'path';
import {fileExists} from '../../lib/util';

export default class FanartProvider implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'container';
    }
    async get(channel, filepath, item) {
        const tbnFile = $path.resolve(filepath, "fanart.jpg");
        if(await fileExists(tbnFile)) {
            const itemPath = $path.relative(channel.rootDir, tbnFile).split($path.sep).map(encodeURIComponent).join("/");
            item.backdrop = channel.pith.rootPath + "/stream/" + itemPath;
            item.backdrops = [{url: item.backdrop}];
        }
    }
}
