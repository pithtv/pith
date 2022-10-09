/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LogResource } from './LogResource';
import type { PagingResourceFilter } from './PagingResourceFilter';
import type { SortDirection } from './SortDirection';

export type LogResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    filters?: Array<PagingResourceFilter> | null;
    totalRecords?: number;
    records?: Array<LogResource> | null;
};

