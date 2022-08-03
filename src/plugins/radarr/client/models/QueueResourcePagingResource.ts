/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { PagingResourceFilter } from './PagingResourceFilter';
import type { QueueResource } from './QueueResource';
import type { SortDirection } from './SortDirection';

export type QueueResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    filters?: Array<PagingResourceFilter> | null;
    totalRecords?: number;
    records?: Array<QueueResource> | null;
};

