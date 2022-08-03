/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaCover } from './MediaCover';
import type { Ratings } from './Ratings';

export type CollectionMovieResource = {
    tmdbId?: number;
    imdbId?: string | null;
    title?: string | null;
    cleanTitle?: string | null;
    sortTitle?: string | null;
    overview?: string | null;
    runtime?: number;
    images?: Array<MediaCover> | null;
    year?: number;
    ratings?: Ratings;
    genres?: Array<string> | null;
    folder?: string | null;
};

