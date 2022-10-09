/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AlternativeTitle } from './AlternativeTitle';
import type { Language } from './Language';
import type { MediaCover } from './MediaCover';
import type { MovieStatusType } from './MovieStatusType';
import type { MovieTranslation } from './MovieTranslation';
import type { Ratings } from './Ratings';

export type MovieMetadata = {
    id?: number;
    tmdbId?: number;
    images?: Array<MediaCover> | null;
    genres?: Array<string> | null;
    inCinemas?: string | null;
    physicalRelease?: string | null;
    digitalRelease?: string | null;
    certification?: string | null;
    year?: number;
    ratings?: Ratings;
    collectionTmdbId?: number;
    collectionTitle?: string | null;
    lastInfoSync?: string | null;
    runtime?: number;
    website?: string | null;
    imdbId?: string | null;
    title?: string | null;
    cleanTitle?: string | null;
    sortTitle?: string | null;
    status?: MovieStatusType;
    overview?: string | null;
    alternativeTitles?: Array<AlternativeTitle> | null;
    translations?: Array<MovieTranslation> | null;
    secondaryYear?: number | null;
    youTubeTrailerId?: string | null;
    studio?: string | null;
    originalTitle?: string | null;
    cleanOriginalTitle?: string | null;
    originalLanguage?: Language;
    recommendations?: Array<number> | null;
    popularity?: number;
    readonly isRecentMovie?: boolean;
};

