/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplyTags } from './ApplyTags';
import type { NewItemMonitorTypes } from './NewItemMonitorTypes';
import type { SeriesTypes } from './SeriesTypes';
export type SeriesEditorResource = {
    seriesIds?: Array<number> | null;
    monitored?: boolean | null;
    monitorNewItems?: NewItemMonitorTypes;
    qualityProfileId?: number | null;
    seriesType?: SeriesTypes;
    seasonFolder?: boolean | null;
    rootFolderPath?: string | null;
    tags?: Array<number> | null;
    applyTags?: ApplyTags;
    moveFiles?: boolean;
    deleteFiles?: boolean;
    addImportListExclusion?: boolean;
};

