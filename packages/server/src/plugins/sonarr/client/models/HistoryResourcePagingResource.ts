/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HistoryResource } from './HistoryResource';
import type { SortDirection } from './SortDirection';
export type HistoryResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    totalRecords?: number;
    records?: Array<HistoryResource> | null;
};

