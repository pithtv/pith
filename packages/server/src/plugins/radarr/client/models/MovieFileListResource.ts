/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Language } from './Language';
import type { QualityModel } from './QualityModel';

export type MovieFileListResource = {
    movieFileIds?: Array<number> | null;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    edition?: string | null;
    releaseGroup?: string | null;
    sceneName?: string | null;
    indexerFlags?: number | null;
};

