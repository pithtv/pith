import {promises as fs} from 'fs';
import {parseString as xml2js} from 'xml2js';
import {IChannelItem} from "@pithmediaserver/api";
import {wrap} from '../../lib/async';

async function parseXml(data) {
    const result = {} as Partial<IChannelItem>;
    const metadata = await wrap<any>(cb => xml2js(data, cb));
    const movie = metadata.movie;
    for (const x of Object.keys(movie)) {
        const valueArr = movie[x];
        const value = (valueArr && valueArr.length === 1) ? valueArr[0] : undefined;

        switch (x) {
            case 'title':
            case 'rating':
            case 'plot':
            case 'tagline':
            case 'studio':
                result[x] = value;
                break;
            case 'genre':
                result.genres = value && value.split(/ ?\/ ?/g);
                break;
            case 'year':
                result.releaseDate = new Date(parseInt(value, 10), 0, 1, 1);
                break;
        }
    }
    return result;
}

async function parsePlain(data) {
    const m = data.toString().match(/tt[0-9]{7,}/g);
    if (m && m[0]) {
        return {imdbId: m[0]};
    }
}

export async function parseNfo(path) {
    const data = await fs.readFile(path);
    try {
        return await parseXml(data);
    } catch (err) {
        return await parsePlain(data);
    }
}
