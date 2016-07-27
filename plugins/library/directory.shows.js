"use strict";

var extend = require("node.extend");

function mapShow(m) {
    return extend({}, m, {
        id: 'shows/' + m.id,
        showId: m.id,
        type: 'container',
        mediatype: 'show',
        showname: m.title
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
        mediatype: 'season'
    });
}

module.exports = [
    {
        id: "shows",
        title: "All shows",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId == null) {
                db.findShows({}, {title: 1}).then(function(result) {
                    cb(false, result.map(mapShow));
                }, cb);
            } else {
                db.findSeasons({showId: containerId}, {season: 1}).then(function(result) {
                    cb(false, result.map(mapSeason));
                }).catch(cb);
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
        id: "recentlyadded",
        title: "Recently Added",
        description: "Episodes added in the past 7 days",
        visible: true,
        type: "container",
        _getContents: function(db, containerId, cb) {
            db.findEpisodes({dateScanned: {$gt: new Date(new Date() - 7*24*60*60*1000)}}, {order: {dateScanned: -1}}, function(err, result) {
                cb(err, result.map(mapEpisode));
            });
        }
    },

    {
        id: "recentlyaired",
        title: "Recently Aired",
        description: "Episodes aired in the past 7 days",
        visible: true,
        type: "container",
        _getContents: function(db, containerId, cb) {
            db.findEpisodes({airDate: {$gt: new Date(new Date() - 7*24*60*60*1000), $lt:new Date()}}, {order: {airDate: -1}}, function(err, result) {
                cb(err, result.map(mapEpisode));
            });
        }
    }
];
