import {MetaDataProvider} from './MetaDataProvider';
import $path from 'path';
import {parseNfo} from './parsenfo';
import fs from 'fs';

export default class TvShowNfoProvider implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'container';
    }
    get(channel, filepath, item, cb) {
        const nfo = $path.join(filepath, "tvshow.nfo");
        fs.stat(nfo, function (err) {
            if (!err) {
                parseNfo(nfo, function (err, result) {
                    if (result) {
                        Object.assign(item, result);
                    }
                    cb(item);
                });
            } else {
                cb(item);
            }
        });
    }
};
