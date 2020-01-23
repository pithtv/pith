import {MetaDataProvider} from './MetaDataProvider';

import $path from 'path';
import fs from 'fs';

export default class FanartProvider implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'container';
    }
    get(channel, filepath, item, cb) {
        const tbnFile = $path.resolve(filepath, "fanart.jpg");
        fs.stat(tbnFile, function(err) {
            if(!err) {
                const itemPath = $path.relative(channel.rootDir, tbnFile).split($path.sep).map(encodeURIComponent).join("/");
                item.backdrop = channel.pith.rootPath + "/stream/" + itemPath;
            }
            cb();
        });
    }
};
