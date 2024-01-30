/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Language } from './Language';
import type { QualityModel } from './QualityModel';
import type { SeriesTitleInfo } from './SeriesTitleInfo';
export type ParsedEpisodeInfo = {
    releaseTitle?: string | null;
    seriesTitle?: string | null;
    seriesTitleInfo?: SeriesTitleInfo;
    quality?: QualityModel;
    seasonNumber?: number;
    episodeNumbers?: Array<number> | null;
    absoluteEpisodeNumbers?: Array<number> | null;
    specialAbsoluteEpisodeNumbers?: Array<number> | null;
    airDate?: string | null;
    languages?: Array<Language> | null;
    fullSeason?: boolean;
    isPartialSeason?: boolean;
    isMultiSeason?: boolean;
    isSeasonExtra?: boolean;
    special?: boolean;
    releaseGroup?: string | null;
    releaseHash?: string | null;
    seasonPart?: number;
    releaseTokens?: string | null;
    dailyPart?: number | null;
    readonly isDaily?: boolean;
    readonly isAbsoluteNumbering?: boolean;
    readonly isPossibleSpecialEpisode?: boolean;
    readonly isPossibleSceneSeasonSpecial?: boolean;
};

