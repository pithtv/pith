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
            /*
             {
             "seriesId": 1,
             "episodeFileId": 806,
             "seasonNumber": 12,
             "episodeNumber": 8,
             "title": "Morning Mimosa",
             "airDate": "2015-03-02",
             "airDateUtc": "2015-03-03T01:30:00Z",
             "overview": "When Steve swears at Francine, she refuses to cook for him, and he becomes a successful chef, appearing on a popular morning show. Meanwhile, Stan thinks he can make people invisible by snapping his fingers.",
             "episodeFile": {
             "seriesId": 1,
             "seasonNumber": 12,
             "relativePath": "Season 12/American Dad! - 12x08 - Morning Mimosa.mkv",
             "path": "/mnt/store/Public/Series/American Dad!/Season 12/American Dad! - 12x08 - Morning Mimosa.mkv",
             "size": 368251435,
             "dateAdded": "2015-03-03T02:56:23.903615Z",
             "sceneName": "American.Dad.S11E08.720p.HDTV.x264-KILLERS",
             "quality": {
             "quality": {
             "id": 4,
             "name": "HDTV-720p"
             },
             "revision": {
             "version": 1,
             "real": 0
             }
             },
             "qualityCutoffNotMet": false,
             "id": 806
             },
             "hasFile": true,
             "monitored": false,
             "sceneAbsoluteEpisodeNumber": 183,
             "sceneEpisodeNumber": 8,
             "sceneSeasonNumber": 11,
             "unverifiedSceneNumbering": false,
             "id": 189
             },
             */

            episodes: episodes && episodes.map(sonarrEpisode => ({
                airDate: sonarrEpisode.airDate,
                dateScanned: sonarrEpisode.dateAdded,
                episode: sonarrEpisode.episodeNumber,
                season: sonarrEpisode.seasonNumber,
                id: `sonarr.show.${show.id}.season.${sonarrEpisode.seasonNumber}.episode.${sonarrEpisode.episodeNumber}`,
                mediatype: 'episode',
                overview: sonarrEpisode.overview,
                playable: sonarrEpisode.hasFile,
                // still: "http://image.tmdb.org/t/p/original/mxSQsHOJdVrUvHC4qoAAubVgiph.jpg",
                title: sonarrEpisode.title,
                type: 'item',
                unavailable: !sonarrEpisode.hasFile
            }))
        };

        return pithShow;
    }

    listContents(containerId) {
        return this._get('api/series').then(series => series.map(show => this.convertSeries(show)));
    }

    getFile(path) {

    }

    getItem(itemId, detailed) {
        let showMatch = itemId.match(/^sonarr\.show\.([^.]*)$/);
        if(showMatch) {
            let seriesId = showMatch[1];
            return Promise.all([
                this._get(`api/episode?seriesId=${seriesId}`),
                this._get(`api/series/${seriesId}`)
            ]).then(result => {
                let episodes = result[0],
                    show = result[1];

                return this.convertSeries(show, episodes);
            });
        } else {
            return Promise.resolve({});
        }
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
