"use strict";

var settings = require("../../lib/global")().settings;
var fetch = require('node-fetch');
var parseUrl = require('url').parse;
var Channel = require("../../lib/channel");
var global = require("../../lib/global")();
var parseDate = require("../../lib/util").parseDate;

function parseItemId(itemId) {
    return {
        id: itemId,
        mediatype: itemId ? 'movie' : 'root'
    };
}

class CouchPotatoChannel extends Channel {
    constructor(pith, url, apikey) {
        super(pith);
        this.url = parseUrl(url.endsWith("/") ? url : url + "/");
        this.pith = pith;
        this.apikey = apikey;
    }

    _get(url) {
        var u = this.url.resolve(`api/${this.apikey}/${url}`);

        return fetch(u).then(res => {
            return res.json()
        });
    }

    listContents(containerId) {
        return this._get('movie.list').then(result => {
            if(result.empty) {
                return [];
            } else {
                return result.movies.map(movie => ({
                    id: movie._id,
                    title: movie.title,
                    type: 'file',
                    playable: movie.releases.length > 0,
                    year: movie.info.year,
                    rating: movie.info.rating.imdb[0],
                    plot: movie.info.plot,
                    tagline: movie.info.tagline,
                    genres: movie.info.genres,
                    imdbId: movie.identifiers.imdb,
                    poster: movie.info.images.poster[0],
                    backdrop: movie.info.images.backdrop[0],
                    // releaseDate: movie.info.released,
                    runtime: movie.info.runtime,
                    actors: movie.info.actors,
                    writers: movie.info.writers
                }));
            }
        });
    }

    getItem(itemId, detailed) {
        let parsed = parseItemId(itemId);
        return Promise.resolve({id: itemId});
    }

    getFile(item) {
        let filesChannel = this.pith.getChannelInstance('files');
        return this._get(`media.get?id=${item.id}`).then(result => {
            // {
            //     "media": {
            //         "status": "done",
            //         "files": {
            //             "nfo": ["/mnt/store/Public/Movies HD/1 - Life on the limit (2013)/1 - Life on the limit.nfo", "/mnt/store/Public/Movies HD/1 - Life on the limit (2013)/1- Life on the limit.orig.nfo"],
            //             "movie": ["/mnt/store/Public/Movies HD/1 - Life on the limit (2013)/1 - Life on the limit.mkv"]
            //         },
            //         "_id": "95ed143525cc4047beab2ee596fa0054",
            //         "media_id": "309aa7b5ff8b497bb99b6f38fdbcf85a",
            //         "releases": [],
            //         "_rev": "028458a9",
            //         "_t": "release",
            //         "is_3d": false,
            //         "last_edit": 1489015406,
            //         "identifier": "tt2518788.DTS.1080p",
            //         "quality": "1080p"
            //     },
            //     "success": true
            // };
            return filesChannel.resolveFile(result.media.releases[0].files.movie[0]);
        });
    }

    getStream(item) {
        let filesChannel = this.pith.getChannelInstance('files');
        return this.getFile(item).then(file => {
            return filesChannel.getStream(file)
        });
    }

    getLastPlayState(itemId) {
        let parsed = parseItemId(itemId);
        if(parsed.mediatype == 'episode') {
            return this.getItem(itemId).then(item => this.getLastPlayStateFromItem(item));
        } else {
            return Promise.resolve();
        }
    }

    getLastPlayStateFromItem(item) {
        if(item.mediatype == 'episode') {
            if(item.unavailable) {
                return Promise.resolve();
            } else {
                let filesChannel = this.pith.getChannelInstance('files');
                return this.getFile(item).then(file => filesChannel.getLastPlayStateFromItem(file));
            }
        } else {
            return Promise.resolve();
        }
    }

    putPlayState(itemId, state) {
        let filesChannel = this.pith.getChannelInstance('files');
        return this.getItem(itemId).then(item => this.getFile(item)).then(file => filesChannel.putPlayState(file.id, state));
    }
}

module.exports = {
    init(opts) {
        if(settings.sonarr && settings.sonarr.enabled && settings.sonarr.url) {
            opts.pith.registerChannel({
                id: 'couchpotato',
                title: 'CouchPotato',
                type: 'channel',
                init(opts) {
                    return new CouchPotatoChannel(opts.pith, settings.couchpotato.url, settings.couchpotato.apikey);
                }
            })
        };
    }
};
