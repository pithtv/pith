"use strict";

var settings = require("../../lib/global")().settings;
var fetch = require('node-fetch');
var parseUrl = require('url').parse;
var Channel = require("../../lib/channel");

class SonarrChannel extends Channel {
    constructor(pith, url, apikey) {
        super(pith);
        this.url = parseUrl(url);
        this.pith = pith;
        this.apikey = apikey;
    }

    _get(url) {
        var u = this.url.resolve(url);
        if(u.indexOf('?') > 0) {
            u += '&';
        } else {
            u += '?';
        }
        u+=`apiKey=${this.apikey}`;

        return fetch(u).then(res => {
            return res.json()
        });
    }

    listContents(containerId) {
        return this._get('api/series').then(series => series.map(show => {
            var img = (type) => {
                var img = show.images.find(img => img.coverType == type),
                    imgUrl = img && img.url && img.url.replace(/(sonarr\/)(.*)/, '$1api/$2&apiKey=' + this.apikey);
                return imgUrl && this.url.resolve(imgUrl);
            };

            return {
                backdrop: img('fanart'),
                creationTime: show.added,
                genres: show.genres,
                id: "sonarr.show." + show.id,
                mediatype: "show",
                noEpisodes: show.episodeCount,
                noSeasons: show.seasonCount,
                title: show.title,
                overview: show.overview,
                poster: img('poster'),
                type: 'container'
            };
        }));
    }

    getFile(path) {

    }

    getItem(itemId, detailed) {
        return Promise.resolve({});
    }

    getStream(item) {

    }

    getLastPlayState(itemId, cb) {
        cb();
    }

    getLastPlayStateFromItem(item, cb) {
        return this.getLastPlayState(item.id);
    }

    putPlayState(itemId, state) {
    }
}

module.exports = {
    init(opts) {
        if(settings.sonarr && settings.sonarr.url) {
            opts.pith.registerChannel({
                id: 'sonarr',
                title: 'Sonarr',
                type: 'channel',
                init(opts) {
                    return new SonarrChannel(opts.pith, settings.sonarr.url, settings.sonarr.apikey);
                }
            })
        };
    }
};
