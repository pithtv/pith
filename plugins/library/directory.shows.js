"use strict";

var async = require("async");

var extend = require("node.extend");

module.exports = function(plugin) {

    var db = plugin.db;

    function mapShow(m, cb) {
        async.mapSeries(m.episodes || [], mapEpisode, function(err, episodes) {
            if(err) cb(err);
            else cb(false, extend({}, m, {
                id: 'shows/' + m.id,
                showId: m.id,
                type: 'container',
                mediatype: 'show',
                showname: m.title,
                episodes: episodes,
                seasons: m.seasons && m.seasons.map(mapSeason)
            }));
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
        plugin.getLastPlayStateFromItem(m, function(err, playState) {
            if(err) cb(err);
            else {
                cb(false,
                    extend({}, m, {
                        id: 'shows/' + m.showId + '/' + m.season + '/' + m.episode,
                        episodeId: m.id,
                        type: 'item',
                        mediatype: 'season',
                        playState: playState
                    }));
            }
        });
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
                if(p.length == 1) {
                    db.findSeasons({showId: containerId}, {season: 1}).then(function (result) {
                        cb(false, result.map(mapSeason));
                    }).catch(cb);
                } else if(p.length == 2) {
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
                if(p.length == 1) {
                    db.findShow({id: itemId}, function (err, show) {
                        if (err || !show) cb(err, show);
                        else mapShow(show, cb);
                    });
                } else if(p.length == 2) {
                    db.findSeason({showId: p[0], season: p[1]}).then(function(result) {
                        cb(err, mapSeason(result));
                    });
                } else if(p.length == 3) {
                    db.findEpisode({showId: p[0], season: parseInt(p[1]), episode: parseInt(p[2])}, function(err, result) {
                        if(err) cb(err);
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
            db.findEpisodes({airDate: {$gt: new Date(new Date() - 7*24*60*60*1000), $lt:new Date()}}, {order: {airDate: -1}}, function(err, result) {
                async.mapSeries(result, mapEpisode, cb);
            });
        }
    }
]};
