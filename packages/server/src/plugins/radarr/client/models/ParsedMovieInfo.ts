/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Language } from './Language';
import type { QualityModel } from './QualityModel';

export type ParsedMovieInfo = {
    movieTitles?: Array<string> | null;
    originalTitle?: string | null;
    releaseTitle?: string | null;
    simpleReleaseTitle?: string | null;
    quality?: QualityModel;
    languages?: Array<Language> | null;
    releaseGroup?: string | null;
    releaseHash?: string | null;
    edition?: string | null;
    year?: number;
    imdbId?: string | null;
    tmdbId?: number;
    extraInfo?: Record<string, any> | null;
    readonly movieTitle?: string | null;
    readonly primaryMovieTitle?: string | null;
};

