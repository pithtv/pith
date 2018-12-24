"use strict";

var async = require("async");
var global = require("../../lib/global")();
var TvShowUtils = require("../../lib/tvshowutils");

module.exports = function(plugin) {

    var db = plugin.db;

    function byEpisode(a,b) {
        return (a.season - b.season) || (a.episode - b.episode);
    }

    function findLastPlayable(episodes) {
        for(let x=episodes.length - 1;x>=0;x--) {
            if(episodes[x].originalId) return episodes[x];
        }
    }

    function mapShow(m, cb) {
        async.mapSeries( (m.episodes || []).sort(byEpisode) || [], mapEpisode, function(err, episodes) {
            if(err) cb(err);
            else {
                var seasons = m.seasons && m.seasons.map(mapSeason).map(function(season) {
                    var seasonEps = episodes.filter(function(ep) {
                        return ep.season === season.season;
                    });
                    var playstate = TvShowUtils.aggregatePlayState(seasonEps);
                    season.playState = playstate;
                    return season;
                });
                var playState = seasons && TvShowUtils.aggregatePlayState(seasons);
                var lastPlayable = findLastPlayable(episodes);
                cb(false, Object.assign({}, m, {
                    id: 'shows/' + m.id,
                    showId: m.id,
                    type: 'container',
                    mediatype: 'show',
                    showname: m.title,
                    episodes: episodes,
                    seasons: seasons,
                    playState: playState,
                    hasNew: lastPlayable && (!lastPlayable.playState || lastPlayable.playState.status !== 'watched') && lastPlayable.dateScanned > (new Date(new Date() - 1000 * 60 * 60 * 24 * global.settings.maxAgeForNew))
                }));
            }
        });
    }

    function mapSeason(m) {
        return extend({}, m, {
            id: 'shows/' + m.showId + '/' + m.season,
            seasonId: m.id,
            type: 'container',
            mediatype: 'season'
        });
    }

    function mapEpisode(m, cb) {
        plugin.getLastPlayStateFromItem(m).then(playState => {
            cb(false,
                Object.assign({}, m, {
                    id: 'shows/' + m.showId + '/' + m.season + '/' + m.episode,
                    episodeId: m.id,
                    type: 'item',
                    mediatype: 'season',
                    playState: playState,
                    playable: m.originalId != null,
                    unavailable: m.originalId == null
                }));
        }).catch(cb);
    }

    return [
    {
        id: "shows",
        title: "All shows",
        type: "container",
        _getContents: function(containerId, cb) {
            if(containerId == null) {
                db.findShows({}, {title: 1}).then(function(result) {
                    async.mapSeries(result, mapShow, cb);
                }, cb);
            } else {
                var p = containerId.split('/');
                if(p.length === 1) {
                    db.findSeasons({showId: containerId}, {season: 1}).then(function (result) {
                        cb(false, result.map(mapSeason));
                    }).catch(cb);
                } else if(p.length === 2) {
                    db.findEpisodes({showId: p[0], season: parseInt(p[1])}, {episode: 1}).then(function (result) {
                        async.mapSeries(result, mapEpisode, cb);
                    });
                }
            }
        },
        _getItem: function(itemId, cb) {
            if(itemId === null) {
                cb(null, {id: 'shows', title: 'All Shows'});
            } else {
                var p = itemId.split('/');
                if(p.length === 1) {
                    db.findShow({id: itemId}, function (err, show) {
                        if (err || !show) cb(err, show);
                        else mapShow(show, cb);
                    });
                } else if(p.length === 2) {
                    db.findSeason({showId: p[0], season: p[1]}).then(function(result) {
                        cb(err, mapSeason(result));
                    });
                } else if(p.length === 3) {
                    db.findEpisode({showId: p[0], season: parseInt(p[1]), episode: parseInt(p[2])}, function(err, result) {
                        if(err || !result) cb(err);
                        else mapEpisode(result, cb);
                    });
                }
            }
        }
    },

    {
        id: "recentlyadded",
        title: "Recently Added",
        description: "Episodes added in the past 7 days",
        visible: true,
        type: "container",
        _getContents: function(containerId, cb) {
            db.findEpisodes({dateScanned: {$gt: new Date(new Date() - 7*24*60*60*1000)}}, {order: {dateScanned: -1}}).then(function(result) {
                async.mapSeries(result, mapEpisode, cb);
            }).catch(function(err) {
                cb(err);    
            });
        }
    },

    {
        id: "recentlyaired",
        title: "Recently Aired",
        description: "Episodes aired in the past 7 days",
        visible: true,
        type: "container",
        _getContents: function(containerId, cb) {
            db.findEpisodes({airDate: {$gt: new Date(new Date() - 7*24*60*60*1000), $lt:new Date()}}, {order: {airDate: -1}}).then(function(result) {
                async.mapSeries(result, mapEpisode, cb);
            });
        }
    }
]};
