/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LogResource } from './LogResource';
import type { SortDirection } from './SortDirection';
export type LogResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    totalRecords?: number;
    records?: Array<LogResource> | null;
};

