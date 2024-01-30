/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlocklistResource } from './BlocklistResource';
import type { SortDirection } from './SortDirection';
export type BlocklistResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    totalRecords?: number;
    records?: Array<BlocklistResource> | null;
};

