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

    convertSeries(show, episodes) {
        var img = (type) => {
            var img = show.images.find(img => img.coverType == type),
                imgUrl = img && img.url && img.url.replace(/(sonarr\/)(.*)/, '$1api/$2&apiKey=' + this.apikey);
            return imgUrl && this.url.resolve(imgUrl);
        };

        let pithShow = {
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
            type: 'container',
            seasons: show.seasons.map(sonarrSeason => ({
                id: `sonarr.show.${show.id}.season.${sonarrSeason.seasonNumber}`,
                mediaType: 'season',
                season: sonarrSeason.seasonNumber,
                type: 'container',
                unavailable: sonarrSeason.episodeCount == 0
            })),
            episodes: episodes && episodes.map(sonarrEpisode => this.convertEpisode(sonarrEpisode))
        };

        return pithShow;
    }

    convertEpisode(sonarrEpisode) {
        return {
            id: `sonarr.episode.${sonarrEpisode.id}`,
            type: 'item',
            mediatype: 'episode',
            airDate: sonarrEpisode.airDate,
            dateScanned: sonarrEpisode.dateAdded,
            season: sonarrEpisode.seasonNumber,
            episode: sonarrEpisode.episodeNumber,
            overview: sonarrEpisode.overview,
            playable: sonarrEpisode.hasFile,
            // still: "http://image.tmdb.org/t/p/original/mxSQsHOJdVrUvHC4qoAAubVgiph.jpg",
            title: sonarrEpisode.title,
            unavailable: !sonarrEpisode.hasFile,
            sonarrEpisodeFileId: sonarrEpisode.episodeFileId
        };
    }

    listContents(containerId) {
        return this._get('api/series').then(series => series.map(show => this.convertSeries(show)));
    }

    getFile(path) {

    }

    getItem(itemId, detailed) {
        let match = itemId.match(/^sonarr\.(show|episode)\.([^.]*)$/),
            mediaType = match && match[1],
            id = match && match[2];
        switch(mediaType) {
            case 'show':
                return Promise.all([
                    this._get(`api/episode?seriesId=${id}`),
                    this._get(`api/series/${id}`)
                ]).then(result => {
                    let episodes = result[0],
                        show = result[1];

                    return this.convertSeries(show, episodes);
                });
            case 'episode':
                return this._get(`api/episode/${id}`).then(episode => this.convertEpisode(episode));
            default:
                return Promise.resolve({id: itemId});
        }
    }

    getStream(item) {
        let filesChannel = this.pith.getChannelInstance('files');
        return this._get(`api/episodeFile/${item.sonarrEpisodeFileId}`).then(file => {
            let fileId = filesChannel.resolveFile(file.path);
            return filesChannel.getItem(fileId);
        }).then(file => {
            return filesChannel.getStream(file)
        });
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
