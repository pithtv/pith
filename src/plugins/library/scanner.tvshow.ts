import async from 'async';
import {getLogger} from 'log4js';
import filenameparser from '../../lib/filenameparser';

const logger = getLogger("pith.plugin.library.scanner.tvshow");
const metadata = require("./metadata.tmdb");

export default function(opts) {
    const db = opts.db;

    return {
        loadShow: function(showName, cb) {
            metadata({
                title: showName
            }, 'show', cb);
        },

        loadAndStoreSeason: function(show, season, cb) {
            logger.info("Fetching metadata for season " + season + " of " + show.title);
            const seasonMetaData = {
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
                const episodes = seasonMetaData._children;
                seasonMetaData._children = undefined;
                logger.info(show.title + " season " + season + " has " + episodes.length + " episodes");
                db.storeSeason(seasonMetaData, function(err) {
                    async.eachSeries(episodes, function(episodeMetaData, callback) {
                        db.findEpisode({showId: show.id, season: seasonMetaData.season, episode: episodeMetaData.episode}, function(err, episode) {
                            if(episode) {
                                Object.assign(episode, episodeMetaData);
                                db.storeEpisode(episode, callback);
                            } else {
                                episodeMetaData.showId = show.id;
                                episodeMetaData.showname = show.title;
                                db.storeEpisode(episodeMetaData, callback);
                            }
                        });
                    }, function(err) {
                        cb(err, seasonMetaData);
                    });
                });
            });
        },

        updateEpisode: function(show, season, episodeMetaData, cb) {
            db.findEpisode({showId: show.id, season: season.season, episode: episodeMetaData.episode}, function(err, episode) {
                if(err) {
                    cb(err);
                } else {
                    if(!episode) {
                        episodeMetaData.showTmdbId = show.tmdbId;
                        episodeMetaData.showId = show.id;
                        episodeMetaData.season = season.season;
                        metadata(episodeMetaData, 'episode', function(err, extraMetaData) {
                            if(err) {
                                logger.info("Episode found but no meta data exists for it.", episodeMetaData.title);
                                const episode = {
                                    ...episodeMetaData,
                                    title: episodeMetaData.title,
                                    showId: show.id,
                                    showname: show.title,
                                    season: season.season,
                                    episode: episodeMetaData.episode,
                                    mediatype: 'episode',
                                    originalId: episodeMetaData.originalId,
                                    channelId: episodeMetaData.channelId,
                                    dateScanned: new Date()
                                };
                                db.storeEpisode(episode, cb);
                            } else {
                                extraMetaData.dateScanned = new Date();
                                extraMetaData.originalId = episodeMetaData.originalId;
                                extraMetaData.channelId = episodeMetaData.channelId;
                                db.storeEpisode(extraMetaData, cb);
                            }
                        });
                    } else {
                        logger.info("Episode found", episodeMetaData, episode);
                        episode.dateScanned = new Date();
                        db.storeEpisode({
                            ...episodeMetaData,
                            ...episode,
                            dateScanned: new Date()
                        }, cb);
                    }
                }
            });
        },

        updateInSeason: function(showMetaData, episodeMetaData, cb) {
            const self = this;
            db.findSeason({showId: showMetaData.id, season: episodeMetaData.season}, function(err, seasonMetaData) {
                if(err) { cb(err); return; }
                if(seasonMetaData == null) {
                    self.loadAndStoreSeason(showMetaData, episodeMetaData.season, function(err, season) {
                        if(err) { cb(err); return; }
                        self.updateEpisode(showMetaData, season, episodeMetaData, cb);
                    })
                } else {
                    self.updateEpisode(showMetaData, seasonMetaData, episodeMetaData, cb);
                }
            });
        },

        updateInShow: function(episodeMetaData, cb) {
            const self = this;
            db.findShow({originalTitle: episodeMetaData.showname}, function(err, showMetaData) {
                //if(err) { cb(err); return; }
                if(err || showMetaData == null) {
                    logger.info("Found a new show", episodeMetaData.showname);
                    self.loadShow(episodeMetaData.showname, function(err, showMetaData) {
                        if(err) {
                            cb(err);
                        } else {
                            showMetaData.originalTitle = episodeMetaData.showname; // use for reference later when querying again
                            db.storeShow(showMetaData, function(err) {
                                self.updateInSeason(showMetaData, episodeMetaData, cb);
                            });
                        }
                    });
                } else {
                    self.updateInSeason(showMetaData, episodeMetaData, cb);
                }
            });
        },

        scan: function(channelInstance, dir, cb) {
            const self = this;

            function scan(container, done) {
                if(container) {
                    channelInstance.listContents(container.id).then(function(contents) {
                        if(!contents) {
                            done();
                            return;
                        }

                        async.eachSeries(contents, function(item, cb) {
                            if(item.type === 'container') {
                                scan(item, cb);
                            } else if(item.playable && item.mimetype.match(/^video\//)) {
                                db.findEpisode({originalId: item.id, channelId: channelInstance.id}, function(err, episode) {
                                    if(episode == null) {
                                        const md = filenameparser(item.title, 'show');

                                        if(md) {
                                            self.updateInShow({
                                                ...md,
                                                originalId: item.id,
                                                channelId: channelInstance.id,
                                                mimetype: item.mimetype
                                            }, function(err) {
                                                if(err) {
                                                    logger.warn("Error while scanning item " + item.id, err);
                                                }
                                                cb();
                                            });

                                            logger.info(md);
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
                    }).catch(err => done(err));
                }
            }

            channelInstance.getItem(dir.containerId).then(function(container) {
                scan(container, cb);
            }).catch(cb);
        }
    };
};
