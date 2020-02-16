import async from 'async';
import {getLogger} from 'log4js';
import filenameparser from '../../lib/filenameparser';

const logger = getLogger('pith.plugin.library.scanner.tvshow');
const metadata = require('./metadata.tmdb');

export default opts => {
    const db = opts.db;

    return {
        loadShow: (showName, cb) => {
            metadata({
                title: showName
            }, 'show', cb);
        },

        loadAndStoreSeason: (show, season, cb) => {
            logger.info('Fetching metadata for season ' + season + ' of ' + show.title);
            const seasonMetaData = {
                season: season,
                showTmdbId: show.tmdbId,
                showId: show.id,
                showname: show.title
            };
            metadata(seasonMetaData, 'season', (err, seasonMetaData) => {
                if (err) {
                    cb(err);
                    return;
                }
                const episodes = seasonMetaData._children;
                seasonMetaData._children = undefined;
                logger.info(show.title + ' season ' + season + ' has ' + episodes.length + ' episodes');
                db.storeSeason(seasonMetaData).then(() => {
                    async.eachSeries(episodes, (episodeMetaData, callback) => {
                        db.findEpisode({
                            showId: show.id,
                            season: seasonMetaData.season,
                            episode: episodeMetaData.episode
                        }).then((episode) => {
                            if (episode) {
                                Object.assign(episode, episodeMetaData);
                                db.storeEpisode(episode).then(() => callback()).catch(callback);
                            } else {
                                episodeMetaData.showId = show.id;
                                episodeMetaData.showname = show.title;
                                db.storeEpisode(episodeMetaData).then(() => callback()).catch(callback);
                            }
                        });
                    }, err => {
                        cb(err, seasonMetaData);
                    });
                });
            });
        },

        updateEpisode: (show, season, episodeMetaData, cb) => {
            db.findEpisode({showId: show.id, season: season.season, episode: episodeMetaData.episode}).then(episode => {
                if (!episode) {
                    episodeMetaData.showTmdbId = show.tmdbId;
                    episodeMetaData.showId = show.id;
                    episodeMetaData.season = season.season;
                    metadata(episodeMetaData, 'episode', (err, extraMetaData) => {
                        if (err) {
                            logger.info('Episode found but no meta data exists for it.', episodeMetaData.title);
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
                            db.storeEpisode(episode).then(() => cb()).catch(cb);
                        } else {
                            extraMetaData.dateScanned = new Date();
                            extraMetaData.originalId = episodeMetaData.originalId;
                            extraMetaData.channelId = episodeMetaData.channelId;
                            db.storeEpisode(extraMetaData).then(() => cb()).catch(cb);
                        }
                    });
                } else {
                    logger.info('Episode found', episodeMetaData, episode);
                    episode.dateScanned = new Date();
                    db.storeEpisode({
                        ...episodeMetaData,
                        ...episode,
                        dateScanned: new Date()
                    }).then(() => cb()).catch(cb);
                }
            }).catch(cb);
        },

        updateInSeason: function (showMetaData, episodeMetaData, cb) {
            db.findSeason({showId: showMetaData.id, season: episodeMetaData.season}).then(seasonMetaData => {
                if (seasonMetaData == null) {
                    this.loadAndStoreSeason(showMetaData, episodeMetaData.season, (err, season) => {
                        if (err) {
                            cb(err);
                            return;
                        }
                        this.updateEpisode(showMetaData, season, episodeMetaData, cb);
                    });
                } else {
                    this.updateEpisode(showMetaData, seasonMetaData, episodeMetaData, cb);
                }
            }).catch(cb);
        },

        updateInShow(episodeMetaData, cb) {
            db.findShow({originalTitle: episodeMetaData.showname}).then(showMetaData => {
                if (showMetaData == null) {
                    logger.info('Found a new show', episodeMetaData.showname);
                    this.loadShow(episodeMetaData.showname, (err, showMetaData) => {
                        if (err) {
                            cb(err);
                        } else {
                            showMetaData.originalTitle = episodeMetaData.showname; // use for reference later when querying again
                            db.storeShow(showMetaData).then(() => {
                                this.updateInSeason(showMetaData, episodeMetaData, cb);
                            });
                        }
                    });
                } else {
                    this.updateInSeason(showMetaData, episodeMetaData, cb);
                }
            }).catch((err) => {
                cb(false);
            });
        },

        scan: function (channelInstance, dir, cb) {
            const scan = (container, done) => {
                if (container) {
                    channelInstance.listContents(container.id).then(contents => {
                        if (!contents) {
                            done();
                            return;
                        }

                        async.eachSeries(contents, (item, cb) => {
                            if (item.type === 'container') {
                                scan(item, cb);
                            } else if (item.playable && item.mimetype.match(/^video\//)) {
                                db.findEpisode({originalId: item.id, channelId: channelInstance.id}).then(episode => {
                                    if (episode == null) {
                                        const md = filenameparser(item.title, 'show');

                                        if (md) {
                                            this.updateInShow({
                                                ...md,
                                                originalId: item.id,
                                                channelId: channelInstance.id,
                                                mimetype: item.mimetype
                                            }, err => {
                                                if (err) {
                                                    logger.warn('Error while scanning item ' + item.id, err);
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
                                }).catch(cb);
                            } else {
                                cb();
                            }
                        }, done);
                    }).catch(err => done(err));
                }
            };

            channelInstance.getItem(dir.containerId).then(container => {
                scan(container, cb);
            }).catch(cb);
        }
    };
};
