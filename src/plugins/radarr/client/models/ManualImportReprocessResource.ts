/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Language } from './Language';
import type { MovieResource } from './MovieResource';
import type { QualityModel } from './QualityModel';
import type { Rejection } from './Rejection';

export type ManualImportReprocessResource = {
    id?: number;
    path?: string | null;
    movieId?: number;
    movie?: MovieResource;
    quality?: QualityModel;
    languages?: Array<Language> | null;
    releaseGroup?: string | null;
    downloadId?: string | null;
    rejections?: Array<Rejection> | null;
};

