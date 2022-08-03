/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddMovieOptions } from './AddMovieOptions';
import type { AlternativeTitleResource } from './AlternativeTitleResource';
import type { Language } from './Language';
import type { MediaCover } from './MediaCover';
import type { MovieCollection } from './MovieCollection';
import type { MovieFileResource } from './MovieFileResource';
import type { MovieStatusType } from './MovieStatusType';
import type { Ratings } from './Ratings';

export type MovieResource = {
    id?: number;
    title?: string | null;
    originalTitle?: string | null;
    originalLanguage?: Language;
    alternateTitles?: Array<AlternativeTitleResource> | null;
    secondaryYear?: number | null;
    secondaryYearSourceId?: number;
    sortTitle?: string | null;
    sizeOnDisk?: number | null;
    status?: MovieStatusType;
    overview?: string | null;
    inCinemas?: string | null;
    physicalRelease?: string | null;
    digitalRelease?: string | null;
    physicalReleaseNote?: string | null;
    images?: Array<MediaCover> | null;
    website?: string | null;
    remotePoster?: string | null;
    year?: number;
    hasFile?: boolean;
    youTubeTrailerId?: string | null;
    studio?: string | null;
    path?: string | null;
    qualityProfileId?: number;
    monitored?: boolean;
    minimumAvailability?: MovieStatusType;
    isAvailable?: boolean;
    folderName?: string | null;
    runtime?: number;
    cleanTitle?: string | null;
    imdbId?: string | null;
    tmdbId?: number;
    titleSlug?: string | null;
    rootFolderPath?: string | null;
    folder?: string | null;
    certification?: string | null;
    genres?: Array<string> | null;
    tags?: Array<number> | null;
    added?: string;
    addOptions?: AddMovieOptions;
    ratings?: Ratings;
    movieFile?: MovieFileResource;
    collection?: MovieCollection;
    popularity?: number;
};

