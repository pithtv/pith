/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from './CustomFormatResource';
import type { EpisodeResource } from './EpisodeResource';
import type { Language } from './Language';
import type { QualityModel } from './QualityModel';
import type { Rejection } from './Rejection';
export type ManualImportReprocessResource = {
    id?: number;
    path?: string | null;
    seriesId?: number;
    seasonNumber?: number | null;
    episodes?: Array<EpisodeResource> | null;
    episodeIds?: Array<number> | null;
    quality?: QualityModel;
    languages?: Array<Language> | null;
    releaseGroup?: string | null;
    downloadId?: string | null;
    customFormats?: Array<CustomFormatResource> | null;
    customFormatScore?: number;
    rejections?: Array<Rejection> | null;
};

