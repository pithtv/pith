/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplyTags } from './ApplyTags';
export type DownloadClientBulkResource = {
    ids?: Array<number> | null;
    tags?: Array<number> | null;
    applyTags?: ApplyTags;
    enable?: boolean | null;
    priority?: number | null;
    removeCompletedDownloads?: boolean | null;
    removeFailedDownloads?: boolean | null;
};

