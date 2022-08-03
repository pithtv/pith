/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MediaCover } from './MediaCover';
import type { MovieMetadata } from './MovieMetadata';
import type { MovieStatusType } from './MovieStatusType';

export type MovieCollection = {
    id?: number;
    title?: string | null;
    cleanTitle?: string | null;
    sortTitle?: string | null;
    tmdbId?: number;
    overview?: string | null;
    monitored?: boolean;
    qualityProfileId?: number;
    rootFolderPath?: string | null;
    searchOnAdd?: boolean;
    minimumAvailability?: MovieStatusType;
    lastInfoSync?: string | null;
    images?: Array<MediaCover> | null;
    added?: string;
    movies?: Array<MovieMetadata> | null;
};

