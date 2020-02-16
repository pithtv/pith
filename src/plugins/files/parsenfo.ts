import {promises as fs} from 'fs';
import {parseString as xml2js} from 'xml2js';
import {IChannelItem} from '../../channel';
import {wrap} from '../../lib/async';

export async function parseNfo(path) {
    const data = await fs.readFile(path);
    const metadata = await wrap<any>(cb => xml2js(data, cb));
    const movie = metadata.movie;
    const result: Partial<IChannelItem> = {};
    for (let x in movie) {
        const valueArr = movie[x];
        const value = (valueArr && valueArr.length === 1) ? valueArr[0] : undefined;

        switch (x) {
            case 'title':
            case 'year':
            case 'rating':
            case 'plot':
            case 'tagline':
            case 'studio':
                result[x] = value;
                break;
            case 'genre':
                result.genre = value.split(/ ?\/ ?/g);
                break;
        }
    }
    return result;
}
