/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HistoryResource } from './HistoryResource';
import type { PagingResourceFilter } from './PagingResourceFilter';
import type { SortDirection } from './SortDirection';

export type HistoryResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    filters?: Array<PagingResourceFilter> | null;
    totalRecords?: number;
    records?: Array<HistoryResource> | null;
};

