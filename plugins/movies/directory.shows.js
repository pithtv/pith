"use strict";

var extend = require("node.extend");

function mapShow(m) {
    return extend({}, m, {
        id: 'shows/' + m.id,
        showId: m.id,
        type: 'container',
        mediatype: 'show'
    });
}

function mapSeason(m) {
    return extend({}, m, {
        id: 'seasons/' + m.id,
        seasonId: m.id,
        type: 'container',
        mediatype: 'season'
    });
}

function mapEpisode(m) {
    return extend({}, m, {
        id: 'episodes/' + m.id,
        episodeId: m.id,
        type: 'item',
        mediatype: 'season',
        playable: (m.originalId != null),
        unavailable: (m.originalId == null)
    });
}

module.exports = [
    {
        id: "shows",
        title: "All shows",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId == null) {
                db.findShows({}, {title: 1}, function (err, result) {
                    cb(err, result.map(mapShow));
                });
            } else {
                db.findSeasons({showId: containerId}, {season: 1}, function(err, result) {
                    cb(err, result.map(mapSeason));
                });
            }
        },
        _getItem: function(db, itemId, cb) {
            if(itemId === null) {
                cb(null, {id: 'shows', title: 'All Shows'});
            } else {
                db.findShow({id: itemId}, function(err, show) {
                    cb(err, show && mapShow(show));
                });
            }
        }
    },

    {
        id: "seasons",
        visible: false,
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId == null) {
                db.findSeasons({}, function(err, result) {
                    cb(err, result.map(mapSeason()));
                })
            } else {
                db.findEpisodes({seasonId: containerId}, {episode: 1}, function(err, result) {
                    cb(err, result.map(mapEpisode));
                })
            }
        },
        _getItem: function(db, itemId, cb) {
            if(itemId === null) {
                cb(null, {id: 'seasons', title: 'All Seasons'});
            } else {
                db.findSeason({id: itemId}, function(err, season) {
                    cb(err, season && mapSeason(season));
                });
            }
        }
    },

    {
        id: "episodes",
        visible: false,
        type: "container",
        _getContents: function(db, containerId, cb) {
            cb(null, []);
        },
        _getItem: function(db, itemId, cb) {
            db.findEpisode({id: itemId}, function(err, episode) {
                cb(err, episode && mapEpisode(episode));
            });
        }
    }
];
