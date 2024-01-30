/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeResource } from './EpisodeResource';
import type { SortDirection } from './SortDirection';
export type EpisodeResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    totalRecords?: number;
    records?: Array<EpisodeResource> | null;
};

