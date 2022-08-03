import {getLogger} from 'log4js';
import {queryEpisode, querySeason, queryShow} from './metadata.tmdb';
import {Episode, Season, Show} from "../../persistence/Schema";
import {v1 as uuid} from 'node-uuid';

const logger = getLogger('pith.plugin.library.scanner.tvshow');

export default opts => {
    const db = opts.db;

    return {
        async findOrCreateShow(name: string) :Promise<Show> {
            const show = await db.findShow({originalTitle: name});
            if(!show) {
                logger.info("New show detected: " + name);
                const show = await queryShow({title: name});
                return {
                    ...show,
                    id: uuid(),
                    originalTitle: name
                }
            }
            return show;
        },

        async getOrCreateSeason(showMetaData: Show, season: number) : Promise<Season> {
            const seasonMetaData = showMetaData.seasons?.find(s => s.season === season);
            if(seasonMetaData) {
                return seasonMetaData;
            } else {
                const newSeasonMetaData = {
                    ...await querySeason({ showTmdbId: showMetaData.tmdbId, season: season }),
                    showId: showMetaData.id
                };
                showMetaData.seasons = [
                    ... showMetaData.seasons,
                    newSeasonMetaData,
                ];
                return newSeasonMetaData;
            }
        },

        async getOrCreateEpisode(showMetaData: Show, seasonMetaData: Season, episode: number) : Promise<Episode> {
            const episodeMetaData = seasonMetaData.episodes?.find(e => e.episode === episode);
            const newEpisodeMetaData = {
                ...await queryEpisode({showTmdbId: showMetaData.tmdbId, season: seasonMetaData.season, episode }),
                showId: showMetaData.id
            };
            if(episodeMetaData) {
                Object.assign(episodeMetaData, newEpisodeMetaData);
                return episodeMetaData
            } else {
                seasonMetaData.episodes.push(newEpisodeMetaData);
                return newEpisodeMetaData
            }
        },

        async updateInShow(episodeMetaData : {showname: string, episode: number, season: number, originalId: string, channelId: string}) {
            const showMetaData = await this.findOrCreateShow(episodeMetaData.showname);
            const season = await this.getOrCreateSeason(showMetaData, episodeMetaData.season);
            const episode : Episode = await this.getOrCreateEpisode(showMetaData, season, episodeMetaData.episode);

            episode.originalId = episodeMetaData.originalId;
            episode.channelId = episodeMetaData.channelId;

            await db.storeShow(showMetaData);
        },

        async scan(channelInstance, dir) {
            const scan = async (container) => {
                if (!container) {
                    return;
                }
                const contents = await channelInstance.listContents(container.id);
                if (!contents) {
                    return;
                }
                for (const item of contents) {
                    if (item.type === 'container') {
                        await scan(item);
                    } else if (item.playable && item.mediatype === 'episode' && item.mimetype?.match(/^video\//)) {
                        const episode = await db.findEpisode({originalId: item.id, channelId: channelInstance.id});
                        if (episode == null) {
                            try {
                                await this.updateInShow({
                                    ...item,
                                    originalId: item.id,
                                    channelId: channelInstance.id,
                                });
                            } catch (err) {
                                logger.warn('Error while scanning item ' + item.id, err);
                            }
                        }
                    }
                }
            };

            return scan(await channelInstance.getItem(dir.containerId));
        }
    };
}
