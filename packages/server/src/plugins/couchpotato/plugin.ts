import * as async from '../../lib/async';
import fetch from 'node-fetch';
import {parse as parseUrl} from 'url';
import {Channel} from '../../lib/channel';
import fs from 'fs';
import path from 'path';
import mimetypes from '../../lib/mimetypes';
import {getLogger} from 'log4js';
import {Pith} from '../../pith';
import {IChannelItem} from '../../channel';
import {FilesChannel} from '../files/plugin';
import {SettingsStore, SettingsStoreSymbol} from '../../settings/SettingsStore';
import {inject, injectable} from 'tsyringe';
import {PithPlugin, plugin} from '../plugins';

const logger = getLogger('pith.plugin.couchpotato');

function parseItemId(itemId) : Partial<IChannelItem> {
    if (itemId) {
        let i = itemId.indexOf('/');
        if (i === -1) {
            throw 'Incorrect id';
        }
        return {
            type: 'file',
            id: itemId.substring(i + 1),
            mediatype: itemId.substring(0, i)
        };
    } else {
        return {
            type: 'container',
            id: 'root',
            mediatype: 'root'
        };
    }
}

class CouchPotatoChannel extends Channel {
    private url;
    private pith: Pith;
    private apikey: string;
    private listing: Promise<IChannelItem[]>;

    constructor(pith, url, apikey) {
        super();
        this.url = parseUrl(url.endsWith('/') ? url : url + '/');
        this.pith = pith;
        this.apikey = apikey;

        this.createEventListener();
        this.listing = this.retrieveContents();
    }

    _get(url) {
        const u = this.url.resolve(`api/${this.apikey}/${url}`);

        return fetch(u).then(res => res.json()).then(j => {
            if (!j.success) {
                throw 'Call failed';
            }
            return j;
        });
    }

    listContents(containerId) {
        return this.listing;
    }

    retrieveContents() {
        logger.debug('Fetching couchpotato index');
        return this._get('movie.list').then(result => {
            logger.debug('Processing couchpotato index');
            if (result.empty) {
                return [];
            } else {
                return async.mapSeries(result.movies.filter(movie => movie.releases.length > 0), movie => (this.mapMovie(movie)));
            }
        }).then(result => {
            logger.debug('Couchpotato index fetched and processed');
            return this.listing = Promise.resolve(result as IChannelItem[]);
        });
    }

    createEventListener() {
        logger.debug('Listening for new couchpotato event');
        this._get('nonblock/notification.listener').then(result => {
            logger.debug('Couchpotato event listener returned', JSON.stringify(result.result));
            let events = result.result;
            if (events.find(e => e.type === 'renamer.after')) {
                // "renamer.after" indicates movie download was completed, so refresh internal listing
                this.retrieveContents();
            }
            this.createEventListener();
        }).catch(e => {
            logger.error('Couchpotato event listener threw', JSON.stringify(e));
            this.createEventListener();
        });
    }

    extractPosterFromCache(movie) {
        let posterPath = movie.files && movie.files.image_poster[0];
        if (posterPath) {
            let uuid = posterPath.substr(posterPath.lastIndexOf('/'));
            return this.url.resolve(`api/${this.apikey}/file.cache/${uuid}`);
        }
    }

    async mapMovie(movie) : Promise<IChannelItem> {
        let release = movie.releases.find(r => r.status === 'done');
        let movieFile = release && release.files.movie && release.files.movie[0];
        let stat;
        try {
            stat = movieFile && await async.wrap(cb => fs.stat(path.dirname(movieFile), cb));
        } catch (e) {
            logger.warn(`File ${movieFile} not accessible, can not determine download date`);
        }

        let filePath = release && release.files.movie[0];
        const id = 'media/' + movie._id;
        return {
            id: id,
            mediatype: 'movie',
            mimetype: filePath && mimetypes.fromFilePath(filePath),
            title: movie.title,
            type: 'file',
            playable: release && true,
            year: movie.info.year,
            rating: movie.info.rating && movie.info.rating.imdb[0],
            plot: movie.info.plot,
            tagline: movie.info.tagline,
            genres: movie.info.genres,
            imdbId: movie.identifiers.imdb,
            poster: movie.info.images.poster_original && movie.info.images.poster_original[0] || movie.info.images.poster[0] || this.extractPosterFromCache(movie),
            backdrop: movie.info.images.backdrop_original && movie.info.images.backdrop_original[0] || movie.info.images.backdrop[0],
            runtime: movie.info.runtime,
            actors: movie.info.actors,
            writers: movie.info.writers,
            filePath: filePath,
            hasNew: movie.tags && movie.tags.indexOf('recent') > -1,
            creationTime: stat && stat.mtime,
            playState: await this.getLastPlayState(id)
        };
    }

    queryMedia(id) {
        return this._get(`media.get?id=${id}`).then(result => (this.mapMovie(result.media)));
    }

    getItem(itemId, detailed = false) {
        let parsed = parseItemId(itemId);
        if (parsed.mediatype === 'media') {
            return this.queryMedia(parsed.id);
        }
        return Promise.resolve({
            sortableFields: ['title', 'year', 'rating', 'runtime', 'creationTime'],
            id: itemId,
            title: 'CouchPotato',
            type: 'container'
        } as IChannelItem);
    }

    getFile(item) {
        let filesChannel = this.pith.getChannelInstance('files') as FilesChannel;
        return filesChannel.resolveFile(item.filePath);
    }

    getStream(item, options) {
        let filesChannel = this.pith.getChannelInstance('files') as FilesChannel;
        return this.getFile(item).then(file => {
            return filesChannel.getStream(file, options);
        });
    }

    getLastPlayState(itemId) {
        let parsed = parseItemId(itemId);
        if (parsed.mediatype === 'media') {
            return this.getItem(itemId).then(item => this.getLastPlayStateFromItem(item));
        } else {
            return Promise.resolve();
        }
    }

    getLastPlayStateFromItem(item) {
        if (item.type === 'file' && item.playable) {
            if (item.unavailable) {
                return Promise.resolve();
            } else {
                let filesChannel = this.pith.getChannelInstance('files');
                return this.getFile(item).then(file => filesChannel.getLastPlayStateFromItem(file));
            }
        } else {
            return Promise.resolve(null);
        }
    }

    putPlayState(itemId, state) {
        let filesChannel = this.pith.getChannelInstance('files');
        return this.getItem(itemId).then(item => this.getFile(item)).then(file => filesChannel.putPlayState(file.id, state));
    }
}

@injectable()
@plugin()
export default class CouchPotatoPlugin implements PithPlugin {
    constructor(@inject(SettingsStoreSymbol) private settingsStore: SettingsStore) {

    }

    init(opts) {
        const pluginSettings = this.settingsStore.settings.couchpotato;
        if (pluginSettings && pluginSettings.enabled && pluginSettings.url) {
            let channel = new CouchPotatoChannel(opts.pith, pluginSettings.url, pluginSettings.apikey);
            opts.pith.registerChannel({
                id: 'couchpotato',
                title: 'CouchPotato',
                init() {
                    return channel;
                }
            })
        }
    }
}
