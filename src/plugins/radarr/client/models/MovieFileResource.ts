/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomFormatResource } from './CustomFormatResource';
import type { Language } from './Language';
import type { MediaInfoResource } from './MediaInfoResource';
import type { QualityModel } from './QualityModel';

export type MovieFileResource = {
    id?: number;
    movieId?: number;
    relativePath?: string | null;
    path?: string | null;
    size?: number;
    dateAdded?: string;
    sceneName?: string | null;
    indexerFlags?: number;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    mediaInfo?: MediaInfoResource;
    originalFilePath?: string | null;
    qualityCutoffNotMet?: boolean;
    languages?: Array<Language> | null;
    releaseGroup?: string | null;
    edition?: string | null;
};

