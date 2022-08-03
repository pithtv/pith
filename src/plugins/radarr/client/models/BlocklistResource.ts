/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomFormatResource } from './CustomFormatResource';
import type { DownloadProtocol } from './DownloadProtocol';
import type { Language } from './Language';
import type { MovieResource } from './MovieResource';
import type { QualityModel } from './QualityModel';

export type BlocklistResource = {
    id?: number;
    movieId?: number;
    sourceTitle?: string | null;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    date?: string;
    protocol?: DownloadProtocol;
    indexer?: string | null;
    message?: string | null;
    movie?: MovieResource;
};

