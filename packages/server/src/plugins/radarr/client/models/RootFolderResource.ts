/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UnmappedFolder } from './UnmappedFolder';

export type RootFolderResource = {
    id?: number;
    path?: string | null;
    accessible?: boolean;
    freeSpace?: number | null;
    unmappedFolders?: Array<UnmappedFolder> | null;
};

