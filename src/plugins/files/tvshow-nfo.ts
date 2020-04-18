import {MetaDataProvider} from './MetaDataProvider';
import $path from 'path';
import {parseNfo} from './parsenfo';
import {fileExists} from '../../lib/util';

export default class TvShowNfoProvider implements MetaDataProvider {
    appliesTo(channel, filepath, item) {
        return item.type === 'container';
    }

    async get(channel, filepath, item) {
        const nfo = $path.join(filepath, 'tvshow.nfo');
        if (await fileExists(nfo)) {
            const result = await parseNfo(nfo);
            if (result) {
                Object.assign(item, result);
            }
        }
    }
}
