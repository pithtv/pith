/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MovieStatusType } from './MovieStatusType';

export type CollectionUpdateResource = {
    collectionIds?: Array<number> | null;
    monitored?: boolean | null;
    monitorMovies?: boolean | null;
    qualityProfileId?: number | null;
    rootFolderPath?: string | null;
    minimumAvailability?: MovieStatusType;
};

