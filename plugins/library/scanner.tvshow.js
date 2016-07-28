var async = require("async");
var winston = require("winston");
var filenameparser = require("../../lib/filenameparser");
var metadata = require("./metadata.tmdb");

module.exports = function(opts) {
    "use strict";

    var db = opts.db;

    return {
        loadShow: function(showName, cb) {
            metadata({
                title: showName
            }, 'show', cb);
        },

        loadAndStoreSeason: function(show, season, cb) {
            winston.info("Fetching metadata for season " + season + " of " + show.title);
            var seasonMetaData = {
                season: season,
                showTmdbId: show.tmdbId,
                showId: show.id,
                showname: show.title
            };
            metadata(seasonMetaData, 'season', function(err, seasonMetaData) {
                if(err) {
                    cb(err);
                    return;
                }
                var episodes = seasonMetaData._children;
                seasonMetaData._children = undefined;
                winston.info(show.title + " season " + season + " has " + episodes.length + " episodes");
                db.storeSeason(seasonMetaData, function(err) {
                    async.eachSeries(episodes, function(episodeMetaData, callback) {
                        db.findEpisode({showId: show.id, season: seasonMetaData.season, episode: episodeMetaData.episode}, function(err, episode) {
                            if(episode) {
                                for(var x in episodeMetaData) {
                                    episode[x] = episodeMetaData[x];
                                }
                                db.storeEpisode(episode, callback);
                            } else {
                                episodeMetaData.showId = show.id;
                                episodeMetaData.showname = show.title;
                                episodeMetaData.playable = false;
                                episodeMetaData.unavailable = true;
                                db.storeEpisode(episodeMetaData, callback);
                            }
                        });
                    }, function(err) {
                        cb(err, seasonMetaData);
                    });
                });
            });
        },

        updateEpisode: function(show, season, item, cb) {
            db.findEpisode({showId: show.id, season: season.season, episode: item.episode}, function(err, episode) {
                if(err) {
                    cb(err);
                } else {
                    if(!episode) {
                        item.showTmdbId = show.tmdbId;
                        item.showId = show.id;
                        item.season = season.season;
                        metadata(item, 'episode', function(err, episodeMetaData) {
                            if(err) {
                                winston.info("Episode found but no meta data exists for it.", item.title);
                                var episode = {
                                    title: item.title,
                                    showId: show.id,
                                    showname: show.title,
                                    season: season.season,
                                    episode: item.episode,
                                    playable: true,
                                    unavailable: false,
                                    mediatype: 'episode',
                                    originalId: item.originalId,
                                    channelId: item.channelId,
                                    dateScanned: new Date()
                                };
                                db.storeEpisode(episode, cb);
                            } else {
                                db.storeEpisode(episodeMetaData, cb);
                            }
                        });
                    } else {
                        winston.info("Episode found", item, episode);
                        episode.originalId = item.originalId;
                        episode.channelId = item.channelId;
                        episode.dateScanned = new Date();
                        episode.playable = true;
                        episode.unavailable = false;
                        db.storeEpisode(episode, cb);
                    }
                }
            });
        },

        updateInSeason: function(showMetaData, item, cb) {
            var self = this;
            db.findSeason({showId: showMetaData.id, season: item.season}, function(err, seasonMetaData) {
            if(err) { cb(err); return; }
                if(seasonMetaData == null) {
                    self.loadAndStoreSeason(showMetaData, item.season, function(err, season) {
                        if(err) { cb(err); return; }
                        self.updateEpisode(showMetaData, season, item, cb);
                    })
                } else {
                    self.updateEpisode(showMetaData, seasonMetaData, item, cb);
                }
            });
        },

        updateInShow: function(episode, cb) {
            var self = this;
            db.findShow({originalTitle: episode.showname}, function(err, showMetaData) {
                //if(err) { cb(err); return; }
                if(err || showMetaData == null) {
                    winston.info("Found a new show", episode.showname)
                    self.loadShow(episode.showname, function(err, showMetaData) {
                        if(err) {
                            cb(err);
                        } else {
                            showMetaData.originalTitle = episode.showname; // use for reference later when querying again
                            db.storeShow(showMetaData, function(err) {
                                self.updateInSeason(showMetaData, episode, cb);
                            });
                        }
                    });
                } else {
                    self.updateInSeason(showMetaData, episode, cb);
                }
            });
        },

        scan: function(channelInstance, dir, cb) {
            var self = this;

            function scan(container, done) {
                if(container) {
                    channelInstance.listContents(container.id, function(err, contents) {
                        if(err || !contents) {
                            done(err);
                            return;
                        }

                        async.eachSeries(contents, function(item, cb) {
                            if(item.type === 'container') {
                                scan(item, cb);
                            } else if(item.playable && item.mimetype.match(/^video\//)) {
                                db.findEpisode({originalId: item.id, channelId: channelInstance.id}, function(err, episode) {
                                    if(episode == null) {
                                        var md = filenameparser(item.title, 'show');

                                        if(md) {
                                            md.originalId = item.id;
                                            md.channelId = channelInstance.id;

                                            self.updateInShow(md, function(err) {
                                                if(err) {
                                                    winston.warn("Error while scanning item " + item.id, err);
                                                }
                                                cb();
                                            });

                                            winston.info(md);
                                        } else {
                                            cb();
                                        }
                                    } else {
                                        cb();
                                    }
                                })
                            } else {
                                cb();
                            }
                        }, done);
                    })
                }
            }

            channelInstance.getItem(dir.containerId, function (err, container) {
            if(err) { cb(err); return; }
                scan(container, cb);
            });
        },

        updateAll: function(cb) {
            db.findShows({status: {$ne: 'Ended'}}, function(err, shows) {
            if(err) { cb(err); return; }
                for(var x=0,l=shows.length; x<l; x++) {
                    var show = shows[x];
                    metadata.getChanges(show, function(err, changeset) {

                    });
                }
            });
        }
    };
};
