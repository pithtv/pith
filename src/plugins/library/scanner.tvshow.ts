import {getLogger} from 'log4js';
import filenameparser from '../../lib/filenameparser';
import {wrap} from '../../lib/async';

const logger = getLogger('pith.plugin.library.scanner.tvshow');
const {TmdbMetaData} = require('./metadata.tmdb');

export default opts => {
    const db = opts.db;

    return {
        loadShow(showName){
            return TmdbMetaData({
                title: showName
            }, 'show');
        },

        async loadAndStoreSeason(show, season) {
            logger.info('Fetching metadata for season ' + season + ' of ' + show.title);
            let seasonMetaData: any = {
                season: season,
                showTmdbId: show.tmdbId,
                showId: show.id,
                showname: show.title
            };
            seasonMetaData = await TmdbMetaData(seasonMetaData, 'season');

            const episodes = seasonMetaData._children;
            seasonMetaData._children = undefined;
            logger.info(show.title + ' season ' + season + ' has ' + episodes.length + ' episodes');

            await db.storeSeason(seasonMetaData);
            for (const episodeMetaData of episodes) {
                const episode = await db.findEpisode({
                    showId: show.id,
                    season: seasonMetaData.season,
                    episode: episodeMetaData.episode
                });
                if (episode) {
                    Object.assign(episode, episodeMetaData);
                    await db.storeEpisode(episode);
                } else {
                    episodeMetaData.showId = show.id;
                    episodeMetaData.showname = show.title;
                    await db.storeEpisode(episodeMetaData);
                }
            }
        },

        async updateEpisode(show, season, episodeMetaData) {
            const episode = db.findEpisode({showId: show.id, season: season.season, episode: episodeMetaData.episode});
            if (!episode) {
                episodeMetaData.showTmdbId = show.tmdbId;
                episodeMetaData.showId = show.id;
                episodeMetaData.season = season.season;
                try {
                    const extraMetaData = await TmdbMetaData(episodeMetaData, 'episode');
                    await db.storeEpisode({
                        ...extraMetaData,
                        dataScanned: new Date(),
                        originalId: episodeMetaData.originalId,
                        channelId: episodeMetaData.channelId
                    });
                } catch(err) {
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
                    await db.storeEpisode(episode);
                }
            } else {
                logger.info('Episode found', episodeMetaData, episode);
                episode.dateScanned = new Date();
                await db.storeEpisode({
                    ...episodeMetaData,
                    ...episode,
                    dateScanned: new Date()
                });
            }
        },

        async updateInSeason(showMetaData, episodeMetaData) {
            const seasonMetaData = await db.findSeason({showId: showMetaData.id, season: episodeMetaData.season});
            if (seasonMetaData == null) {
                const season = await this.loadAndStoreSeason(showMetaData, episodeMetaData.season);
                await this.updateEpisode(showMetaData, season, episodeMetaData);
            } else {
                await this.updateEpisode(showMetaData, seasonMetaData, episodeMetaData);
            }
        },

        async updateInShow(episodeMetaData) {
            let showMetaData = await db.findShow({originalTitle: episodeMetaData.showname});
            if (showMetaData == null) {
                logger.info('Found a new show', episodeMetaData.showname);
                showMetaData = await wrap(cb => this.loadShow(episodeMetaData.showname, cb));
                showMetaData.originalTitle = episodeMetaData.showname; // use for reference later when querying again

                await db.storeShow(showMetaData);
                await this.updateInSeason(showMetaData, episodeMetaData);
            } else {
                await this.updateInSeason(showMetaData, episodeMetaData);
            }
        },

        scan: function (channelInstance, dir, cb) {
            const scan = async (container) => {
                if (container) {
                    const contents = await channelInstance.listContents(container.id);
                    if (!contents) {
                        return;
                    }

                    for (const item of contents) {
                        if (item.type === 'container') {
                            await scan(item);
                        } else if (item.playable && item.mimetype.match(/^video\//)) {
                            const episode = await db.findEpisode({originalId: item.id, channelId: channelInstance.id});
                            if (episode == null) {
                                const md = filenameparser(item.title, 'show');

                                if (md) {
                                    try {
                                        await this.updateInShow({
                                            ...md,
                                            originalId: item.id,
                                            channelId: channelInstance.id,
                                            mimetype: item.mimetype
                                        });
                                    } catch (err) {
                                        logger.warn('Error while scanning item ' + item.id, err);
                                    }

                                    logger.info(md);
                                }
                            }
                        }
                    }
                }
            };

            channelInstance.getItem(dir.containerId).then(container => {
                scan(container);
            }).catch(cb);
        }
    };
};
