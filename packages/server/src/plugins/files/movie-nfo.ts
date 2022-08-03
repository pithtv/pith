import {MetaDataProvider} from './MetaDataProvider';

import parsefilename from '../../lib/filenameparser';
import $path from 'path';
import {parseNfo} from './parsenfo';
import {fileExists} from '../../lib/util';

class MovieNfo implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'file';
    }

    async get(channel, filepath, item) {
        if (item.mimetype && item.mimetype.match(/^video\//)) {
            const nfoFile = $path.join($path.dirname(filepath), 'movie.nfo');

            const meta = parsefilename(filepath);
            if (meta) {
                Object.assign(item, meta);
            }

            let data;
            if (await fileExists(nfoFile)) {
                data = await parseNfo(nfoFile);
            } else {
                const plainNfoFile = filepath.replace(/\.[^.\/]*$/, '.nfo');
                if (await fileExists(plainNfoFile)) {
                    data = await parseNfo(plainNfoFile);
                }
            }

            if(data) {
                Object.assign(item, data);
            }
        }
    }
}

export default MovieNfo;
