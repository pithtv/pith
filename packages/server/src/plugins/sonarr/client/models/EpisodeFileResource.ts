/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from './CustomFormatResource';
import type { Language } from './Language';
import type { MediaInfoResource } from './MediaInfoResource';
import type { QualityModel } from './QualityModel';
export type EpisodeFileResource = {
    id?: number;
    seriesId?: number;
    seasonNumber?: number;
    relativePath?: string | null;
    path?: string | null;
    size?: number;
    dateAdded?: string;
    sceneName?: string | null;
    releaseGroup?: string | null;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    customFormatScore?: number;
    mediaInfo?: MediaInfoResource;
    qualityCutoffNotMet?: boolean;
};

