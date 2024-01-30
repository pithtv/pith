/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from './CustomFormatResource';
import type { EpisodeResource } from './EpisodeResource';
import type { Language } from './Language';
import type { QualityModel } from './QualityModel';
import type { Rejection } from './Rejection';
import type { SeriesResource } from './SeriesResource';
export type ManualImportResource = {
    id?: number;
    path?: string | null;
    relativePath?: string | null;
    folderName?: string | null;
    name?: string | null;
    size?: number;
    series?: SeriesResource;
    seasonNumber?: number | null;
    episodes?: Array<EpisodeResource> | null;
    episodeFileId?: number | null;
    releaseGroup?: string | null;
    quality?: QualityModel;
    languages?: Array<Language> | null;
    qualityWeight?: number;
    downloadId?: string | null;
    customFormats?: Array<CustomFormatResource> | null;
    customFormatScore?: number;
    rejections?: Array<Rejection> | null;
};

