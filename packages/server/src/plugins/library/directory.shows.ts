import * as async from '../../lib/async';
import * as TvShowUtils from '../../lib/tvshowutils';
import {container} from 'tsyringe';
import {SettingsStore} from '../../settings/SettingsStore';
import {Directory} from "./types";
import {Episode, Season, Show} from "../../persistence/Schema";
import {SharedRibbons} from "../../ribbon";
import {IChannelItem, IMediaChannelItem} from "@pithmediaserver/api";

const settingsStore = container.resolve<SettingsStore>('SettingsStore');

export default function (plugin): Directory {

    const db = plugin.db;

    function findLastPlayable(episodes) {
        for (let x = episodes.length - 1; x >= 0; x--) {
            if (episodes[x].originalId) {
                return episodes[x];
            }
        }
    }

    async function mapShow(m: Show): Promise<IChannelItem> {
        const seasons = await async.mapSeries(m.seasons, season => mapSeason(season));
        const playState = seasons && TvShowUtils.aggregatePlayState(seasons);
        let allEpisodes = seasons.map(season => season.episodes).reduce((a, b) => a.concat(b), []);
        const lastPlayable = findLastPlayable(allEpisodes);
        return {
            ...m,
            id: 'shows/' + m.id,
            showId: m.id,
            type: 'container',
            mediatype: 'show',
            showname: m.title,
            seasons: seasons,
            playState: playState,
            hasNew: lastPlayable && (!lastPlayable.playState || lastPlayable.playState.status !== 'watched') && lastPlayable.dateScanned > (new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * settingsStore.settings.maxAgeForNew))
        };
    }

    async function mapSeason(season: Season): Promise<IChannelItem> {
        let mappedEpisodes = await async.mapSeries(season.episodes, episode => mapEpisode(episode));
        return {
            ...season,
            type: 'container',
            id: `shows/${season.showId}/${season.season}`,
            mediatype: 'season',
            episodes: mappedEpisodes,
            playState: TvShowUtils.aggregatePlayState(mappedEpisodes)
        };
    }

    async function mapEpisode(episode: Episode): Promise<IMediaChannelItem> {
        let playState = await plugin.getLastPlayStateFromItem(episode);
        return {
            ...episode,
            id: `shows/${episode.showId}/${episode.season}/${episode.episode}`,
            type: 'file',
            mediatype: 'episode',
            playState: playState || {},
            playable: episode.originalId != null,
            releaseDate: episode.airDate,
            unavailable: episode.originalId == null
        };
    }

    return {
        directories: [
            {
                id: "shows",
                title: "All shows",
                type: "container",
                async _getContents(containerId) {
                    if (containerId == null) {
                        let result = await db.findShows({}, {title: 1});
                        return async.mapSeries(result, mapShow);
                    } else {
                        const p = containerId.split('/');
                        if (p.length === 1) {
                            let result: Season[] = await db.findSeasons({showId: containerId}, {season: 1});
                            return async.mapSeries(result, season => mapSeason(season));
                        } else if (p.length === 2) {
                            let result: Episode[] = await db.findEpisodes({showId: p[0], season: parseInt(p[1])}, {episode: 1});
                            return async.mapSeries(result, episode => mapEpisode(episode));
                        }
                    }
                },
                async _getItem(itemId) {
                    if (itemId === null) {
                        return {id: 'shows', title: 'All Shows', type: 'container'};
                    } else {
                        const p = itemId.split('/');
                        if (p.length === 1) {
                            let show = await db.findShow({id: itemId});
                            if (show) {
                                return await mapShow(show);
                            }
                        } else if (p.length === 2) {
                            let result = await db.findSeason({showId: p[0], season: p[1]});
                            return await mapSeason(result);
                        } else if (p.length === 3) {
                            let result = await db.findEpisode({showId: p[0], season: parseInt(p[1]), episode: parseInt(p[2])});
                            if (result) {
                                return await mapEpisode(result);
                            }
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
                async _getContents() {
                    let result: Episode[] = await db.findEpisodes({dateScanned: {$gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)}}, {dateScanned: -1});
                    return await async.mapSeries(result, episode => mapEpisode(episode));
                }
            },

            {
                id: "recentlyaired",
                title: "Recently Aired",
                description: "Episodes aired in the past 7 days",
                visible: true,
                type: "container",
                async _getContents() {
                    let result: Episode[] = await db.findEpisodes({
                        airDate: {
                            $gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                            $lt: new Date()
                        }
                    }, {airDate: -1});
                    return await async.mapSeries(result, episode => mapEpisode(episode));
                }
            }
        ],
        ribbons: [
            {
                ribbon: SharedRibbons.recentlyAdded,
                async getContents(maximum: number): Promise<IMediaChannelItem[]> {
                    let result: Episode[] = await db.findEpisodes({dateScanned: {$gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)}}, {dateScanned: -1});
                    return await async.mapSeries(result, episode => mapEpisode(episode));
                }
            }, {
                ribbon: SharedRibbons.recentlyReleased,
                async getContents(maximum: number): Promise<IMediaChannelItem[]> {
                    let result: Episode[] = await db.findEpisodes({
                        airDate: {
                            $gt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                            $lt: new Date()
                        }
                    }, {airDate: -1});
                    return await async.mapSeries(result, episode => mapEpisode(episode));
                }
            }
        ]
    }
};
