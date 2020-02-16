import {MetaDataProvider} from './MetaDataProvider';

import parsefilename from '../../lib/filenameparser';
import $path from 'path';
import {parseNfo} from './parsenfo';
import {promises as fs} from 'fs';
import {fileExists} from '../../lib/util';

class MovieNfo implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'file';
    }

    async get(channel, filepath, item) {
        if (item.mimetype && item.mimetype.match(/^video\//)) {
            const nfoFile = $path.join($path.dirname(filepath), 'movie.nfo');

            if (await fileExists(nfoFile)) {
                const data = await parseNfo(nfoFile);
                Object.assign(item, data);
            } else {
                const plainNfoFile = filepath.replace(/\.[^.\/]*$/, '.nfo');
                if (await fileExists(plainNfoFile)) {
                    const data = await fs.readFile(plainNfoFile);
                    if (data) {
                        const m = data.toString().match(/tt[0-9]{7,}/g);
                        if (m && m[0]) {
                            item.imdbId = m[0];
                        }
                    }
                } else {
                    // try to deduce info from the filename and directory
                    const meta = parsefilename(filepath);
                    if (meta) {
                        Object.assign(item, meta);
                    }
                }
            }
        }
    }
}

export default MovieNfo;
