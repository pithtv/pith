import lib from '../../lib/global';
import mimetypes from '../../lib/mimetypes';
import {parseDate} from '../../lib/util';
import * as TvShowUtils from '../../lib/tvshowutils';
import {Channel} from '../../lib/channel';
import {parse as parseUrl} from 'url';
import fetch from 'node-fetch';
import {Pith} from '../../pith';
import {FilesChannel} from '../files/plugin';
import {IChannelItem, ITvShow, ITvShowEpisode, ITvShowSeason} from '../../channel';
import {mapSeries} from '../../lib/async';

const settings = lib().settings;
const global = lib();

interface SonarrSeries {
    title: string,
    alternateTitles: { title: string, seasonNumber: number }[],
    sortTitle: string,
    seasonCount: number,
    totalEpisodeCount: number,
    episodeCount: number,
    episodeFileCount: number,
    sizeOnDisk: number,
    status: string,
    overview: string,
    previousAiring: string,
    network: string,
    airTime: string,
    images: { coverType: string, url: string }[],
    seasons: SonarrSeason[],
    year: number,
    path: string,
    profileId: number,
    seasonFolder: boolean,
    monitored: boolean,
    useSceneNumber: boolean,
    runtime: number,
    tvdbId: number,
    tvRageId: number,
    tvMazeId: number,
    firstAired: string,
    lastInfoSync: string,
    seriesType: string,
    cleanTitle: string,
    imdbId: string,
    titleSlug: string,
    certification: string,
    genres: string[],
    tags: string[],
    added: string,
    ratings: {
        votes: number,
        value: number
    },
    qualityProfileId: number,
    id: number
}

interface SonarrEpisode {
    seriesId: number,
    episodeFileId: number,
    seasonNumber: number,
    episodeNumber: number,
    title: string,
    airDate: string,
    airDateUtc: string,
    overview: string,
    hasFile: boolean,
    monitored: boolean,
    sceneEpisodeNumber: number,
    sceneSeasonNumber: number,
    tvDbEpisodeId: number,
    absoluteEpisodeNumber: number,
    id: number
}

interface SonarrSeason {
    seasonNumber: number,
    monitored: boolean,
    statistics: {
        previousAiring: string,
        episodeFileCount: number,
        episodeCount: number,
        totalEpisodeCount: number,
        sizeOnDisk: number,
        percentOfEpisodes: number
    }
}

function parseItemId(itemId) {
    if (!itemId) {
        return {
            mediatype: 'root'
        };
    }
    let match = itemId.match(/^sonarr\.(show|episode)\.([^.]*)$/);
    if (match) {
        let mediatype = match && match[1],
            id = match && match[2];
        return {mediatype, id};
    }
}

class SonarrChannel extends Channel {
    private url;
    private pith: Pith;
    private apikey: any;

    constructor(pith, url, apikey) {
        super();
        this.url = parseUrl(url.endsWith('/') ? url : url + '/');
        this.pith = pith;
        this.apikey = apikey;
    }

    _get(url) {
        let u = this.url.resolve(url);
        if (u.indexOf('?') > 0) {
            u += '&';
        } else {
            u += '?';
        }
        u += `apiKey=${this.apikey}`;

        return fetch(u).then(res => {
            return res.json();
        });
    }

    img(show, type) {
        let img = show.images.find(img => img.coverType === type),
            imgUrl = img && img.url && img.url.replace(/(sonarr\/)(.*)/, '$1api/$2&apiKey=' + this.apikey);
        return imgUrl && this.url.resolve(imgUrl);
    }

    convertSeries(show, episodes): Promise<ITvShow> {
        let pithShow: ITvShow = {
            creationTime: show.added,
            genres: show.genres,
            id: 'sonarr.show.' + show.id,
            mediatype: 'show',
            noEpisodes: show.episodeCount,
            noSeasons: show.seasonCount,
            title: show.title,
            overview: show.overview,
            backdrop: this.img(show, 'fanart'),
            poster: this.img(show, 'poster'),
            banner: this.img(show, 'banner'),
            type: 'container',
            seasons: show.seasons.map(sonarrSeason => this.convertSeason(show, sonarrSeason))
        };

        if (episodes) {
            return mapSeries(episodes, sonarrEpisode => this.convertEpisode(sonarrEpisode)).then(mappedEpisodes => {
                let lastPlayable;
                for (let x = mappedEpisodes.length; x && !lastPlayable; x--) {
                    if (mappedEpisodes[x - 1].playable) {
                        lastPlayable = mappedEpisodes[x - 1];
                    }
                }

                pithShow.seasons.forEach(season => {
                    let seasonEps = mappedEpisodes.filter(ep => ep.season === season.season);
                    season.playState = TvShowUtils.aggregatePlayState(seasonEps);
                });

                return {
                    episodes: mappedEpisodes,
                    hasNew: lastPlayable && (!lastPlayable.playState || lastPlayable.playState.status !== 'watched') && lastPlayable.dateScanned > (new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * global.settings.maxAgeForNew)),
                    playState: TvShowUtils.aggregatePlayState(pithShow.seasons),
                    ...pithShow
                };
            });
        } else {
            return Promise.resolve(pithShow);
        }
    }

    convertSeason(show, sonarrSeason): ITvShowSeason {
        return ({
            id: `sonarr.show.${show.id}.season.${sonarrSeason.seasonNumber}`,
            title: sonarrSeason.seasonNumber === 0 ? 'Specials' : `Season ${sonarrSeason.seasonNumber}`,
            mediatype: 'season',
            season: sonarrSeason.seasonNumber,
            noEpisodes: sonarrSeason.statistics.totalEpisodeCount,
            backdrop: this.img(show, 'fanart'),
            poster: this.img(show, 'poster'),
            banner: this.img(show, 'banner'),
            type: 'container',
            unavailable: sonarrSeason.statistics.episodeCount === 0
        });
    }

    async convertEpisode(sonarrEpisode): Promise<ITvShowEpisode> {
        let episode: ITvShowEpisode = {
            id: `sonarr.episode.${sonarrEpisode.id}`,
            type: 'file',
            mediatype: 'episode',
            mimetype: sonarrEpisode.episodeFile && mimetypes.fromFilePath(sonarrEpisode.episodeFile.relativePath),
            airDate: sonarrEpisode.airDate && new Date(sonarrEpisode.airDate),
            dateScanned: sonarrEpisode.episodeFile && parseDate(sonarrEpisode.episodeFile.dateAdded),
            season: sonarrEpisode.seasonNumber,
            episode: sonarrEpisode.episodeNumber,
            overview: sonarrEpisode.overview,
            playable: sonarrEpisode.hasFile,
            title: sonarrEpisode.title,
            unavailable: !sonarrEpisode.hasFile,
            sonarrEpisodeFileId: sonarrEpisode.episodeFileId,
            _episodeFile: sonarrEpisode.episodeFile
        };
        return this.getLastPlayStateFromItem(episode).then(playState => {
            return {playState, ...episode};
        });
    }

    async listContents(containerId) {
        if (containerId) {
            let [, showId, , seasonId] = containerId.match(/^sonarr\.show\.([^.]*)(\.season\.([^.]*))?/);
            if (showId !== undefined && seasonId === undefined) {
                let series = await this.querySeries(showId);
                let seasons = series.seasons;
                return seasons.map(sonarrSeason => this.convertSeason(series, sonarrSeason));
            } else if (showId !== undefined && seasonId !== undefined) {
                let allEpisodes = await this.queryEpisodes(showId);
                let seasonNumber = parseInt(seasonId);
                let seasonEpisodes = allEpisodes.filter(e => e.seasonNumber === seasonNumber);
                return Promise.all(seasonEpisodes.map(e => this.convertEpisode(e)));
            }
        } else {
            let series = await this.queryAllSeries();
            series.sort((a, b) => a.title.localeCompare(b.title));
            return await mapSeries(series, (async show => {
                let episodes = await this.queryEpisodes(show.id);
                return await this.convertSeries(show, episodes);
            }));
        }
    }


    getItem(itemId, detailed = false) {
        let parsed = parseItemId(itemId);
        let sonarrId = parsed.id;
        switch (parsed.mediatype) {
            case 'show':
                return Promise.all([
                    this.queryEpisodes(sonarrId),
                    this.querySeries(sonarrId)
                ]).then(([episodes, show]) => {
                    return this.convertSeries(show, episodes);
                });
            case 'episode':
                return this._get(`api/episode/${sonarrId}`).then(episode => this.convertEpisode(episode));
            default:
                return Promise.resolve({id: itemId} as IChannelItem);
        }
    }

    private queryAllSeries(): Promise<SonarrSeries[]> {
        return this._get('api/series');
    }

    private querySeries(sonarrId): Promise<SonarrSeries> {
        return this._get(`api/series/${sonarrId}`);
    }

    private queryEpisodes(sonarrId): Promise<SonarrEpisode[]> {
        return this._get(`api/episode?seriesId=${sonarrId}`);
    }

    private async getFile(item) {
        let filesChannel = this.pith.getChannelInstance('files') as FilesChannel;
        let sonarrFile;

        if (item._episodeFile) {
            sonarrFile = item._episodeFile;
        } else {
            sonarrFile = await this._get(`api/episodeFile/${item.sonarrEpisodeFileId}`);
        }
        return await filesChannel.resolveFile(sonarrFile.path);
    }

    getStream(item, options) {
        let filesChannel = this.pith.getChannelInstance('files');
        return this.getFile(item).then(file => {
            return filesChannel.getStream(file, options);
        });
    }

    getLastPlayState(itemId) {
        let parsed = parseItemId(itemId);
        if (parsed.mediatype === 'episode') {
            return this.getItem(itemId).then(item => this.getLastPlayStateFromItem(item));
        } else {
            return Promise.resolve();
        }
    }

    getLastPlayStateFromItem(item) {
        if (item.mediatype === 'episode') {
            if (item.unavailable) {
                return Promise.resolve();
            } else {
                let filesChannel = this.pith.getChannelInstance('files');
                return this.getFile(item).then(file => filesChannel.getLastPlayStateFromItem(file));
            }
        } else {
            return Promise.resolve(undefined);
        }
    }

    putPlayState(itemId, state) {
        let filesChannel = this.pith.getChannelInstance('files');
        return this.getItem(itemId).then(item => this.getFile(item)).then(file => filesChannel.putPlayState(file.id, state));
    }
}

export function init(opts) {
    if (settings.sonarr && settings.sonarr.enabled && settings.sonarr.url) {
        opts.pith.registerChannel({
            id: 'sonarr',
            title: 'Sonarr',
            init(opts) {
                return new SonarrChannel(opts.pith, settings.sonarr.url, settings.sonarr.apikey);
            }
        })
    }
};
