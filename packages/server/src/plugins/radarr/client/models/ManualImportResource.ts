/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Language } from './Language';
import type { MovieResource } from './MovieResource';
import type { QualityModel } from './QualityModel';
import type { Rejection } from './Rejection';

export type ManualImportResource = {
    id?: number;
    path?: string | null;
    relativePath?: string | null;
    folderName?: string | null;
    name?: string | null;
    size?: number;
    movie?: MovieResource;
    quality?: QualityModel;
    languages?: Array<Language> | null;
    releaseGroup?: string | null;
    qualityWeight?: number;
    downloadId?: string | null;
    rejections?: Array<Rejection> | null;
};

