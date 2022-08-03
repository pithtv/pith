/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BlocklistResource } from './BlocklistResource';
import type { PagingResourceFilter } from './PagingResourceFilter';
import type { SortDirection } from './SortDirection';

export type BlocklistResourcePagingResource = {
    page?: number;
    pageSize?: number;
    sortKey?: string | null;
    sortDirection?: SortDirection;
    filters?: Array<PagingResourceFilter> | null;
    totalRecords?: number;
    records?: Array<BlocklistResource> | null;
};

