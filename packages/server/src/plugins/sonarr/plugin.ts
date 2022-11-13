import mimetypes from '../../lib/mimetypes';
import {flatMap, parseDate} from '../../lib/util';
import * as TvShowUtils from '../../lib/tvshowutils';
import {Channel} from '../../lib/channel';
import {parse as parseUrl} from 'url';
import fetch from 'node-fetch';
import {Pith} from '../../pith';
import {mapSeries} from '../../lib/async';
import {SettingsStoreSymbol} from '../../settings/SettingsStore';
import {container} from 'tsyringe';
import {PithPlugin, plugin} from '../plugins';
import md5 from 'MD5';
import {getLogger} from "log4js";
import {SonarrEpisode, SonarrSeries} from "./sonarr";
import {SharedRibbons} from "../../ribbon";
import * as Arrays from "../../lib/Arrays";
import {Accessor, Comparator} from "../../lib/Arrays";
import {AsyncCache} from "../../lib/cache";
import {FilesChannel} from "../files/FilesChannel";
import {mapPath} from "../../lib/PathMapper";
import {
    IChannelItem,
    Image,
    IMediaChannelItem,
    IPlayState,
    ITvShow,
    ITvShowEpisode,
    ITvShowSeason,
    PathMappings,
    Ribbon
} from "@pithmediaserver/api";
import {StreamDescriptor} from "@pithmediaserver/api/types/stream";

const logger = getLogger('pith.plugin.sonarr');
const settingsStore = container.resolve(SettingsStoreSymbol);

export interface SonarrEpisodeItem extends ITvShowEpisode {
    _episodeFile: {
        path: string;
    }
    sonarrEpisodeFileId: number
}

function parseItemId(itemId) {
    if (!itemId) {
        return {
            mediatype: 'root'
        };
    }
    const match = itemId.match(/^sonarr\.(show|episode)\.([^.]*)$/);
    if (match) {
        const [,mediatype,id] = match;
        return {mediatype, id};
    }
}

function lastDateScanned(seasonEps: IChannelItem[]) : Date {
    const {value: lastEpisode} = Arrays.max(seasonEps, Arrays.compare(ep => ep.unavailable ? 0 : ep.dateScanned));
    return lastEpisode.dateScanned;
}

function lastReleaseDate(seasonEps: IChannelItem[]) : Date {
    const {value: lastEpisode} = Arrays.max(seasonEps, Arrays.compare(ep => ep.unavailable ? 0 : ep.releaseDate));
    return lastEpisode.releaseDate;
}

class SonarrChannel extends Channel {
    private url;
    private pith: Pith;
    private apikey: any;

    private episodeCache: AsyncCache<number, string, SonarrEpisode[]> = new AsyncCache();

    constructor(pith, url, apikey, private pathMappings: PathMappings = null) {
        super();
        this.url = parseUrl(url.endsWith('/') ? url : url + '/');
        this.pith = pith;
        this.apikey = apikey;
    }

    private _get(url): Promise<any> {
        const startTime = new Date().getTime();
        let u = this.url.resolve(url);
        if (u.indexOf('?') > 0) {
            u += '&';
        } else {
            u += '?';
        }
        u += `apiKey=${this.apikey}`;

        logger.trace("Querying sonarr", url);
        return fetch(u).then(res => {
            logger.trace("Query %s took %d ms", url, (new Date().getTime() - startTime));
            return res.json();
        });
    }

    private imgs(show: SonarrSeries): {
        posters: Image[],
        backdrops: Image[],
        banners: Image[]
    } {
        const perType: { [coverType: string]: { url: string }[] } = show.images.reduce((result, img) => ({
            ...result,
            [img.coverType]: [...(result[img.coverType] || []), {url: this.url.resolve(img.url.replace(/(.*\/)(MediaCover.*)/, '$1api/$2&apiKey=' + this.apikey))}]
        }), {});

        return {
            posters: perType.poster,
            backdrops: perType.fanart,
            banners: perType.banner
        };
    }

    private async convertSeries(show: SonarrSeries, episodes: SonarrEpisode[]): Promise<ITvShow> {
        const pithShow: ITvShow = {
            creationTime: show.added && new Date(show.added),
            genres: show.genres,
            id: 'sonarr.show.' + show.id,
            mediatype: 'show',
            noEpisodes: show.episodeCount,
            noSeasons: show.seasonCount,
            title: show.title,
            overview: show.overview,
            ...this.imgs(show),
            type: 'container',
            seasons: show.seasons.map(sonarrSeason => this.convertSeason(show, sonarrSeason))
        };

        if (episodes) {
            const mappedEpisodes = await mapSeries(episodes, sonarrEpisode => this.convertEpisode(sonarrEpisode, show));

            const lastPlayable = this.findLastPlayable(mappedEpisodes);

            pithShow.seasons.forEach(season => {
                const seasonEps = mappedEpisodes.filter(ep => ep.season === season.season);
                season.playState = TvShowUtils.aggregatePlayState(seasonEps);
                season.episodes = seasonEps;

                season.dateScanned = lastDateScanned(seasonEps);
                season.releaseDate = lastReleaseDate(seasonEps);
            });

            return {
                hasNew: lastPlayable && (!lastPlayable.playState || lastPlayable.playState.status !== 'watched') && lastPlayable.dateScanned > (new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * settingsStore.settings.maxAgeForNew)),
                playState: TvShowUtils.aggregatePlayState(pithShow.seasons),
                dateScanned: lastDateScanned(pithShow.seasons),
                releaseDate: lastReleaseDate(pithShow.seasons),
                ...pithShow
            };
        } else {
            return pithShow;
        }
    }

    private findLastPlayable(mappedEpisodes: SonarrEpisodeItem[]): SonarrEpisodeItem {
        let lastPlayable;
        for (let x = mappedEpisodes.length; x && !lastPlayable; x--) {
            if (mappedEpisodes[x - 1].playable) {
                lastPlayable = mappedEpisodes[x - 1];
            }
        }
        return lastPlayable;
    }

    private convertSeason(show, sonarrSeason): ITvShowSeason {
        return ({
            id: `sonarr.show.${show.id}.season.${sonarrSeason.seasonNumber}`,
            title: sonarrSeason.seasonNumber === 0 ? 'Specials' : `Season ${sonarrSeason.seasonNumber}`,
            mediatype: 'season',
            season: sonarrSeason.seasonNumber,
            noEpisodes: sonarrSeason.statistics.totalEpisodeCount,
            ...this.imgs(show),
            type: 'container',
            unavailable: sonarrSeason.statistics.episodeCount === 0
        });
    }

    private async convertEpisode(sonarrEpisode: SonarrEpisode, sonarrSeries?: SonarrSeries): Promise<SonarrEpisodeItem> {
        const episode: SonarrEpisodeItem = {
            id: `sonarr.episode.${sonarrEpisode.id}`,
            type: 'file',
            mediatype: 'episode',
            mimetype: sonarrEpisode.episodeFile && mimetypes.fromFilePath(sonarrEpisode.episodeFile.relativePath),
            releaseDate: sonarrEpisode.airDate && new Date(sonarrEpisode.airDate),
            dateScanned: sonarrEpisode.episodeFile && parseDate(sonarrEpisode.episodeFile.dateAdded),
            season: sonarrEpisode.seasonNumber,
            episode: sonarrEpisode.episodeNumber,
            overview: sonarrEpisode.overview,
            playable: sonarrEpisode.hasFile,
            title: sonarrEpisode.title,
            unavailable: !sonarrEpisode.hasFile,
            sonarrEpisodeFileId: sonarrEpisode.episodeFileId,
            _episodeFile: sonarrEpisode.episodeFile,
            ...sonarrSeries ? this.imgs(sonarrSeries) : {}
        };
        const playState = await this.getLastPlayStateFromItem(episode);
        if (playState === undefined) {
            return {
                ...episode
            };
        }
        return {playState, ...episode};
    }

    async listContents(containerId) {
        if (containerId) {
            const [, showId, , seasonId] = containerId.match(/^sonarr\.show\.([^.]*)(\.season\.([^.]*))?/);
            if (showId !== undefined && seasonId === undefined) {
                const series = await this.querySeries(showId);
                const seasons = series.seasons;
                return seasons.map(sonarrSeason => this.convertSeason(series, sonarrSeason));
            } else if (showId !== undefined && seasonId !== undefined) {
                const allEpisodes = await this.queryEpisodes(showId);
                const series = await this.querySeries(showId);
                const seasonNumber = parseInt(seasonId, 10);
                const seasonEpisodes = allEpisodes.filter(e => e.seasonNumber === seasonNumber);
                return Promise.all(seasonEpisodes.map(e => this.convertEpisode(e, series)));
            }
        } else {
            return await this.findAllSeries();
        }
    }

    private async findAllSeries(): Promise<ITvShow[]> {
        const series = await this.queryAllSeries();
        series.sort((a, b) => a.title.localeCompare(b.title));
        return await mapSeries(series, (async show => {
            const cacheKey = md5(JSON.stringify([
                show.sizeOnDisk,
                show.lastInfoSync
            ]));
            const episodes = await this.queryEpisodes(show.id, cacheKey);
            return await this.convertSeries(show, episodes);
        }));
    }

    getItem(itemId, detailed = false): Promise<IChannelItem | SonarrEpisodeItem> {
        const parsed = parseItemId(itemId);
        const sonarrId = parsed.id;
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

    private async queryEpisodes(sonarrId: number, cacheKey?: string): Promise<SonarrEpisode[]> {
        if (cacheKey !== undefined) {
            return this.episodeCache.resolve(sonarrId, cacheKey, () => this.queryEpisodes(sonarrId));
        }
        return this._get(`api/episode?seriesId=${sonarrId}`);
    }

    private async getFile(item): Promise<IChannelItem> {
        const filesChannel = this.getDelegateChannelInstance();
        let sonarrFile;

        if (item._episodeFile) {
            sonarrFile = item._episodeFile;
        } else {
            sonarrFile = await this._get(`api/episodeFile/${item.sonarrEpisodeFileId}`);
        }
        return await filesChannel.resolveFile(this.mapPath(sonarrFile.path));
    }

    private getDelegateChannelInstance(): FilesChannel {
        return this.pith.getChannelInstance('files') as FilesChannel;
    }

    private async getFileId(item: SonarrEpisodeItem): Promise<string> {
        const filesChannel = this.getDelegateChannelInstance();
        const sonarrFile = item._episodeFile;
        return filesChannel.resolveFileId(this.mapPath(sonarrFile.path));
    }

    private mapPath(remotePath: string) {
        return mapPath(remotePath, this.pathMappings);
    }

    async getStream(item, options): Promise<StreamDescriptor> {
        const filesChannel = this.pith.getChannelInstance('files');
        const file = await this.getFile(item);
        return filesChannel.getStream(file, options);
    }

    async getLastPlayState(itemId): Promise<IPlayState | undefined> {
        const parsed = parseItemId(itemId);
        if (parsed.mediatype === 'episode') {
            const item = this.getItem(itemId);
            return this.getLastPlayStateFromItem(item);
        }
        return undefined;
    }

    async getLastPlayStateFromItem(item): Promise<IPlayState | undefined> {
        if (item.mediatype === 'episode' && !item.unavailable) {
            const filesChannel = this.getDelegateChannelInstance();
            const fileId = await this.getFileId(item);
            try {
                return filesChannel.getLastPlayState(fileId);
            } catch (e) {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    async putPlayState(itemId, state): Promise<void> {
        const filesChannel = this.pith.getChannelInstance('files');
        const item = await this.getItem(itemId);
        const fileId = await this.getFileId(item as SonarrEpisodeItem);
        await filesChannel.putPlayState(fileId, state);
    }

    async getRibbons(): Promise<Ribbon[]> {
        return [SharedRibbons.recentlyAdded, SharedRibbons.recentlyReleased, SharedRibbons.continueWatching];
    }

    private async findByEpisode(maximum: number, accessor: Accessor<IChannelItem>): Promise<ITvShowEpisode[]> {
        const allSeries = await this.findAllSeries();
        const filteredSeries = allSeries.filter(accessor).sort(Arrays.reverse(Arrays.compare(accessor)));
        const series = filteredSeries.slice(0, maximum);
        return series.map(show => {
            const {value: episode} = Arrays.max(
                show.seasons.map(season => season.episodes).reduce(flatMap),
                Arrays.compare(accessor) as Comparator<ITvShowEpisode>);
            return episode;
        });
    }

    /**
     * Find the last played shows. Then for each return either the last played episode if it wasn't finished yet, or the next episode if it was.
     * @param maximum
     * @private
     */
    private async findContinueWatching(maximum: number): Promise<ITvShowEpisode[]> {
        const series = (await this.findAllSeries())
            .filter(s => s.playState?.updated)
            .sort((a, b) => b.playState.updated?.getTime() - a.playState.updated?.getTime())
            .slice(0, maximum);

        return series.map(s => this.findNextEpisode(s)).filter(ep => ep);
    }

    private findNextEpisode(series: ITvShow): ITvShowEpisode {
        const episodes = series.seasons.map(season => season.episodes).reduce(flatMap).filter(ep => ep.playState?.status === 'watched' || ep.playState?.status === 'inprogress');
        const {value: episode} = Arrays.max(episodes, Arrays.compare(ep => ep.playState.time));
        if(episode.playState.status === 'watched') {
            const laterEpisodes = episodes.filter(ep => ep.season === episode.season && ep.episode > episode.episode || ep.season > episode.season);
            return Arrays.max(laterEpisodes,
                Arrays.reverse(Arrays.chain(Arrays.compare(ep => ep.season), Arrays.compare(ep => ep.episode)))
            ).value;
        } else if(episode.playState.status === 'inprogress') {
            return episode;
        }
    }

    listRibbonContents(ribbonId: string, maximum: number): Promise<IMediaChannelItem[]> {
        switch (ribbonId) {
            case SharedRibbons.recentlyReleased.id:
                return this.findByEpisode(maximum, e => e.unavailable ? 0 : e.releaseDate);
            case SharedRibbons.recentlyAdded.id:
                return this.findByEpisode(maximum, e => e.unavailable ? 0 : e.dateScanned);
            case SharedRibbons.continueWatching.id:
                return this.findContinueWatching(maximum);
        }
    }
}

@plugin()
export default class SonarrPlugin implements PithPlugin {
    init(opts) {
        const pluginSettings = settingsStore.settings.sonarr;
        if (pluginSettings && pluginSettings.enabled && pluginSettings.url) {
            opts.pith.registerChannel({
                id: 'sonarr',
                title: 'Sonarr',
                init(channelInitOpts) {
                    return new SonarrChannel(channelInitOpts.pith, pluginSettings.url, pluginSettings.apikey, pluginSettings.pathMapping);
                }
            });
        }
    };
}
