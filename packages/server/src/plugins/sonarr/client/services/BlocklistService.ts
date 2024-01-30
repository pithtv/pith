/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlocklistBulkResource } from '../models/BlocklistBulkResource';
import type { BlocklistResourcePagingResource } from '../models/BlocklistResourcePagingResource';
import type { SortDirection } from '../models/SortDirection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class BlocklistService {
    /**
     * @param page
     * @param pageSize
     * @param sortKey
     * @param sortDirection
     * @returns BlocklistResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3Blocklist(
        page: number = 1,
        pageSize: number = 10,
        sortKey?: string,
        sortDirection?: SortDirection,
    ): CancelablePromise<BlocklistResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/blocklist',
            query: {
                'page': page,
                'pageSize': pageSize,
                'sortKey': sortKey,
                'sortDirection': sortDirection,
            },
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Blocklist(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/blocklist/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3BlocklistBulk(
        requestBody?: BlocklistBulkResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/blocklist/bulk',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
