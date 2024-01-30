/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddSeriesOptions } from './AddSeriesOptions';
import type { AlternateTitleResource } from './AlternateTitleResource';
import type { Language } from './Language';
import type { MediaCover } from './MediaCover';
import type { NewItemMonitorTypes } from './NewItemMonitorTypes';
import type { Ratings } from './Ratings';
import type { SeasonResource } from './SeasonResource';
import type { SeriesStatisticsResource } from './SeriesStatisticsResource';
import type { SeriesStatusType } from './SeriesStatusType';
import type { SeriesTypes } from './SeriesTypes';
export type SeriesResource = {
    id?: number;
    title?: string | null;
    alternateTitles?: Array<AlternateTitleResource> | null;
    sortTitle?: string | null;
    status?: SeriesStatusType;
    readonly ended?: boolean;
    profileName?: string | null;
    overview?: string | null;
    nextAiring?: string | null;
    previousAiring?: string | null;
    network?: string | null;
    airTime?: string | null;
    images?: Array<MediaCover> | null;
    originalLanguage?: Language;
    remotePoster?: string | null;
    seasons?: Array<SeasonResource> | null;
    year?: number;
    path?: string | null;
    qualityProfileId?: number;
    seasonFolder?: boolean;
    monitored?: boolean;
    monitorNewItems?: NewItemMonitorTypes;
    useSceneNumbering?: boolean;
    runtime?: number;
    tvdbId?: number;
    tvRageId?: number;
    tvMazeId?: number;
    firstAired?: string | null;
    lastAired?: string | null;
    seriesType?: SeriesTypes;
    cleanTitle?: string | null;
    imdbId?: string | null;
    titleSlug?: string | null;
    rootFolderPath?: string | null;
    folder?: string | null;
    certification?: string | null;
    genres?: Array<string> | null;
    tags?: Array<number> | null;
    added?: string;
    addOptions?: AddSeriesOptions;
    ratings?: Ratings;
    statistics?: SeriesStatisticsResource;
    episodesChanged?: boolean | null;
    /**
     * @deprecated
     */
    readonly languageProfileId?: number;
};

