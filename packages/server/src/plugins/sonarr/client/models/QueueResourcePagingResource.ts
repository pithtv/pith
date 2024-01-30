/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QueueResource } from './QueueResource';
import type { SortDirection } from './SortDirection';
export type QueueResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    totalRecords?: number;
    records?: Array<QueueResource> | null;
};

