import * as async from '../../lib/async';
import * as TvShowUtils from '../../lib/tvshowutils';
import lib from '../../lib/global';
import {ITvShow, ITvShowEpisode} from '../../channel';

const global = lib();
export default function(plugin) {

    const db = plugin.db;

    function byEpisode(a,b) {
        return (a.season - b.season) || (a.episode - b.episode);
    }

    function findLastPlayable(episodes) {
        for(let x=episodes.length - 1;x>=0;x--) {
            if(episodes[x].originalId) return episodes[x];
        }
    }

    async function mapShow(m) {
        const episodes = await async.mapSeries( (m.episodes || []).sort(byEpisode), mapEpisode);
        const seasons = m.seasons && m.seasons.map(mapSeason).map(season => {
            const seasonEps = episodes.filter(function(ep) {
                return ep.season === season.season;
            });
            season.playState = TvShowUtils.aggregatePlayState(seasonEps);
            return season;
        });
        const playState = seasons && TvShowUtils.aggregatePlayState(seasons);
        const lastPlayable = findLastPlayable(episodes);
        return Object.assign({}, m, {
            id: 'shows/' + m.id,
            showId: m.id,
            type: 'container',
            mediatype: 'show',
            showname: m.title,
            episodes: episodes,
            seasons: seasons,
            playState: playState,
            hasNew: lastPlayable && (!lastPlayable.playState || lastPlayable.playState.status !== 'watched') && lastPlayable.dateScanned > (new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * global.settings.maxAgeForNew))
        });
    }

    function mapSeason(m) {
        return Object.assign({}, m, {
            id: 'shows/' + m.showId + '/' + m.season,
            seasonId: m.id,
            type: 'container',
            mediatype: 'season'
        });
    }

    async function mapEpisode(m) {
        let playState = plugin.getLastPlayStateFromItem(m);
        return Object.assign({}, m, {
            id: 'shows/' + m.showId + '/' + m.season + '/' + m.episode,
            episodeId: m.id,
            type: 'file',
            mediatype: 'season',
            playState: playState,
            playable: m.originalId != null,
            unavailable: m.originalId == null
        });
    }

    return [
    {
        id: "shows",
        title: "All shows",
        type: "container",
        async _getContents(containerId) {
            if(containerId == null) {
                let result = await db.findShows({}, {title: 1});
                return async.mapSeries(result, mapShow);
            } else {
                const p = containerId.split('/');
                if(p.length === 1) {
                    let result = await db.findSeasons({showId: containerId}, {season: 1});
                    return result.map(mapSeason);
                } else if(p.length === 2) {
                    let result = await db.findEpisodes({showId: p[0], season: parseInt(p[1])}, {episode: 1});
                    return async.mapSeries(result, mapEpisode);
                }
            }
        },
        async _getItem(itemId) {
            if(itemId === null) {
                return {id: 'shows', title: 'All Shows'};
            } else {
                const p = itemId.split('/');
                if(p.length === 1) {
                    let show = await async.wrap<ITvShow>(cb => db.findShow({id: itemId}, cb));
                    if (show) {
                        return await mapShow(show);
                    }
                } else if(p.length === 2) {
                    let result = await db.findSeason({showId: p[0], season: p[1]});
                    return mapSeason(result);
                } else if(p.length === 3) {
                    let result = await async.wrap<ITvShowEpisode>(cb => db.findEpisode({showId: p[0], season: parseInt(p[1]), episode: parseInt(p[2])}, cb));
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
            let result = await db.findEpisodes({dateScanned: {$gt: new Date(new Date().getTime() - 7*24*60*60*1000)}}, {dateScanned: -1});
            return await async.mapSeries(result, mapEpisode);
        }
    },

    {
        id: "recentlyaired",
        title: "Recently Aired",
        description: "Episodes aired in the past 7 days",
        visible: true,
        type: "container",
        async _getContents() {
            let result = await db.findEpisodes({airDate: {$gt: new Date(new Date().getTime() - 7*24*60*60*1000), $lt:new Date()}}, {airDate: -1});
            return await async.mapSeries(result, mapEpisode);
        }
    }
]};
