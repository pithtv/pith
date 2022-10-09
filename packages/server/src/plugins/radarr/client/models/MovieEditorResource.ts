/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ApplyTags } from './ApplyTags';
import type { MovieStatusType } from './MovieStatusType';

export type MovieEditorResource = {
    movieIds?: Array<number> | null;
    monitored?: boolean | null;
    qualityProfileId?: number | null;
    minimumAvailability?: MovieStatusType;
    rootFolderPath?: string | null;
    tags?: Array<number> | null;
    applyTags?: ApplyTags;
    moveFiles?: boolean;
    deleteFiles?: boolean;
    addImportExclusion?: boolean;
};

