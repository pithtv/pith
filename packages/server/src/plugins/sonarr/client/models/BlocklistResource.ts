/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from './CustomFormatResource';
import type { DownloadProtocol } from './DownloadProtocol';
import type { Language } from './Language';
import type { QualityModel } from './QualityModel';
import type { SeriesResource } from './SeriesResource';
export type BlocklistResource = {
    id?: number;
    seriesId?: number;
    episodeIds?: Array<number> | null;
    sourceTitle?: string | null;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    date?: string;
    protocol?: DownloadProtocol;
    indexer?: string | null;
    message?: string | null;
    series?: SeriesResource;
};

