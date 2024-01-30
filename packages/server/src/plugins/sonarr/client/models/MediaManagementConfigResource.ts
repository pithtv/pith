/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeTitleRequiredType } from './EpisodeTitleRequiredType';
import type { FileDateType } from './FileDateType';
import type { ProperDownloadTypes } from './ProperDownloadTypes';
import type { RescanAfterRefreshType } from './RescanAfterRefreshType';
export type MediaManagementConfigResource = {
    id?: number;
    autoUnmonitorPreviouslyDownloadedEpisodes?: boolean;
    recycleBin?: string | null;
    recycleBinCleanupDays?: number;
    downloadPropersAndRepacks?: ProperDownloadTypes;
    createEmptySeriesFolders?: boolean;
    deleteEmptyFolders?: boolean;
    fileDate?: FileDateType;
    rescanAfterRefresh?: RescanAfterRefreshType;
    setPermissionsLinux?: boolean;
    chmodFolder?: string | null;
    chownGroup?: string | null;
    episodeTitleRequired?: EpisodeTitleRequiredType;
    skipFreeSpaceCheckWhenImporting?: boolean;
    minimumFreeSpaceWhenImporting?: number;
    copyUsingHardlinks?: boolean;
    useScriptImport?: boolean;
    scriptImportPath?: string | null;
    importExtraFiles?: boolean;
    extraFileExtensions?: string | null;
    enableMediaInfo?: boolean;
};

