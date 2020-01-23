import {MetaDataProvider} from './MetaDataProvider';

import $path from 'path';
import fs from 'fs';

export default class ThumbnailsProvider implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'file';
    }

    get(channel, filepath, item, cb) {
        let tbnFile = filepath.replace(/\.[^.\/]*$/, '.tbn');
        fs.stat(tbnFile, function (err) {
            if (!err) {
                const path = channel.rootDir;
                const matchRootDir = new RegExp('^' + path);
                var itemPath = tbnFile.replace(matchRootDir, '').split($path.sep).map(encodeURIComponent).join('/');
                item.thumbnail = channel.pith.rootPath + '/stream/' + itemPath;
                cb();
            } else {
                tbnFile = $path.join($path.dirname(filepath), 'movie.tbn');
                fs.stat(tbnFile, function (err) {
                    if (!err) {
                        const path = channel.rootDir;
                        const matchRootDir = new RegExp('^' + path);
                        const itemPath = tbnFile.replace(matchRootDir, '').split($path.sep).map(encodeURIComponent).join('/');
                        item.thumbnail = channel.pith.rootPath + '/stream/' + itemPath;
                    } else if (item.mimetype && item.mimetype.startsWith('video')) {
                        item.still = channel.pith.rootPath + '/preview/' + item.id.split($path.sep).map(encodeURIComponent).join('/') + '/0:10:00.jpg';
                    }
                    cb();
                });
            }
        });
    }
};
