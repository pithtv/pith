import {MetaDataProvider} from './MetaDataProvider';

import $path from 'path';
import {fileExists} from '../../lib/util';

export default class ThumbnailsProvider implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'file';
    }

    async get(channel, filepath, item) {
        let tbnFile = filepath.replace(/\.[^.\/]*$/, '.tbn');
        if (await fileExists(tbnFile)) {
            const path = channel.rootDir;
            const matchRootDir = new RegExp('^' + path);
            const itemPath = tbnFile.replace(matchRootDir, '').split($path.sep).map(encodeURIComponent).join('/');
            item.thumbnail = channel.pith.rootPath + '/stream/' + itemPath;
        } else {
            tbnFile = $path.join($path.dirname(filepath), 'movie.tbn');
            if (await fileExists(tbnFile)) {
                const path = channel.rootDir;
                const matchRootDir = new RegExp('^' + path);
                const itemPath = tbnFile.replace(matchRootDir, '').split($path.sep).map(encodeURIComponent).join('/');
                item.thumbnail = channel.pith.rootPath + '/stream/' + itemPath;
            } else if (item.mimetype && item.mimetype.startsWith('video')) {
                item.still = channel.pith.rootPath + '/files/preview/' + item.id.split($path.sep).map(encodeURIComponent).join('/') + '/0:10:00.jpg';
            }
        }
    }
}
