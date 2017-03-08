"use strict";

var settings = require("../../lib/global")().settings;
var fetch = require('node-fetch');
var parseUrl = require('url').parse;
var Channel = require("../../lib/channel");
var TvShowUtils = require("../../lib/tvshowutils");
var global = require("../../lib/global")();
var parseDate = require("../../lib/util").parseDate;

function parseItemId(itemId) {
    if(!itemId) {
        return {
            mediatype: 'root'
        };
    }
    let match = itemId.match(/^sonarr\.(show|episode)\.([^.]*)$/);
    if(match) {
        let mediatype = match && match[1],
            id = match && match[2];
        return {mediatype, id};
    }
}

class SonarrChannel extends Channel {
    constructor(pith, url, apikey) {
        super(pith);
        this.url = parseUrl(url.endsWith("/") ? url : url + "/");
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
                mediatype: 'season',
                season: sonarrSeason.seasonNumber,
                type: 'container',
                unavailable: sonarrSeason.episodeCount == 0
            }))
        };

        let mappedEpisodes;
        if(episodes) {
            return Promise.all(episodes.map(sonarrEpisode => this.convertEpisode(sonarrEpisode))).then(mappedEpisodes => {
                pithShow.episodes = mappedEpisodes;

                let lastPlayable;
                for(let x=mappedEpisodes.length;x && !lastPlayable;x--) {
                    if(mappedEpisodes[x-1].playable) lastPlayable = mappedEpisodes[x-1];
                }

                pithShow.seasons.forEach(season => {
                    let seasonEps = mappedEpisodes.filter(ep => ep.season == season.season);
                    season.playState = TvShowUtils.aggregatePlayState(seasonEps);
                });

                pithShow.playState = TvShowUtils.aggregatePlayState(pithShow.seasons);

                pithShow.hasNew = lastPlayable && (!lastPlayable.playState || lastPlayable.playState.status != 'watched') && lastPlayable.dateScanned > (new Date(new Date() - 1000 * 60 * 60 * 24 * global.settings.maxAgeForNew));

                return pithShow
            });
        } else {
            return Promise.resolve(pithShow);
        }
    }

    convertEpisode(sonarrEpisode) {
        let episode = {
            id: `sonarr.episode.${sonarrEpisode.id}`,
            type: 'item',
            mediatype: 'episode',
            airDate: sonarrEpisode.airDate,
            dateScanned: sonarrEpisode.episodeFile && parseDate(sonarrEpisode.episodeFile.dateAdded),
            season: sonarrEpisode.seasonNumber,
            episode: sonarrEpisode.episodeNumber,
            overview: sonarrEpisode.overview,
            playable: sonarrEpisode.hasFile,
            // still: "http://image.tmdb.org/t/p/original/mxSQsHOJdVrUvHC4qoAAubVgiph.jpg",
            title: sonarrEpisode.title,
            unavailable: !sonarrEpisode.hasFile,
            sonarrEpisodeFileId: sonarrEpisode.episodeFileId,
            _episodeFile: sonarrEpisode.episodeFile
        };
        return this.getLastPlayStateFromItem(episode).then(playState => {
            episode.playState = playState;
            return episode;
        })
    }

    listContents(containerId) {
        return this._get('api/series').then(
            series => series.sort((a,b) => a.title.localeCompare(b.title))
        ).then(
            series => series.map(show => this.queryEpisodes(show.id).then(episodes => this.convertSeries(show, episodes)))
        );
    }

    getItem(itemId, detailed) {
        let parsed = parseItemId(itemId);
        var sonarrId = parsed.id;
        switch(parsed.mediatype) {
            case 'show':
                return Promise.all([
                    this.queryEpisodes(sonarrId),
                    this.querySeries(sonarrId)
                ]).then(result => {
                    let episodes = result[0],
                        show = result[1];

                    return this.convertSeries(show, episodes);
                });
            case 'episode':
                return this._get(`api/episode/${sonarrId}`).then(episode => this.convertEpisode(episode));
            default:
                return Promise.resolve({id: itemId});
        }
    }

    querySeries(sonarrId) {
        return this._get(`api/series/${sonarrId}`);
    }

    queryEpisodes(sonarrId) {
        return this._get(`api/episode?seriesId=${sonarrId}`);
    }

    getFile(item) {
        let filesChannel = this.pith.getChannelInstance('files'),
            sonarrFile;

        if(item._episodeFile) {
            sonarrFile = Promise.resolve(item._episodeFile);
        } else {
            sonarrFile = this._get(`api/episodeFile/${item.sonarrEpisodeFileId}`);
        }
        return sonarrFile.then(file => {
            return filesChannel.resolveFile(file.path)
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
