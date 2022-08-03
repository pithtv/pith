/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileDateType } from './FileDateType';
import type { ProperDownloadTypes } from './ProperDownloadTypes';
import type { RescanAfterRefreshType } from './RescanAfterRefreshType';

export type MediaManagementConfigResource = {
    id?: number;
    autoUnmonitorPreviouslyDownloadedMovies?: boolean;
    recycleBin?: string | null;
    recycleBinCleanupDays?: number;
    downloadPropersAndRepacks?: ProperDownloadTypes;
    createEmptyMovieFolders?: boolean;
    deleteEmptyFolders?: boolean;
    fileDate?: FileDateType;
    rescanAfterRefresh?: RescanAfterRefreshType;
    autoRenameFolders?: boolean;
    pathsDefaultStatic?: boolean;
    setPermissionsLinux?: boolean;
    chmodFolder?: string | null;
    chownGroup?: string | null;
    skipFreeSpaceCheckWhenImporting?: boolean;
    minimumFreeSpaceWhenImporting?: number;
    copyUsingHardlinks?: boolean;
    importExtraFiles?: boolean;
    extraFileExtensions?: string | null;
    enableMediaInfo?: boolean;
};

