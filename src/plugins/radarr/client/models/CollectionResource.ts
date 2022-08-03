/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CollectionMovieResource } from './CollectionMovieResource';
import type { MediaCover } from './MediaCover';
import type { MovieStatusType } from './MovieStatusType';

export type CollectionResource = {
    id?: number;
    title?: string | null;
    sortTitle?: string | null;
    tmdbId?: number;
    images?: Array<MediaCover> | null;
    overview?: string | null;
    monitored?: boolean;
    rootFolderPath?: string | null;
    qualityProfileId?: number;
    searchOnAdd?: boolean;
    minimumAvailability?: MovieStatusType;
    movies?: Array<CollectionMovieResource> | null;
};

