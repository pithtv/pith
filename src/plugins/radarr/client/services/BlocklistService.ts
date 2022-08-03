/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BlocklistBulkResource } from '../models/BlocklistBulkResource';
import type { BlocklistResource } from '../models/BlocklistResource';
import type { BlocklistResourcePagingResource } from '../models/BlocklistResourcePagingResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BlocklistService {

    /**
     * @returns BlocklistResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3Blocklist(): CancelablePromise<BlocklistResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/blocklist',
        });
    }

    /**
     * @param movieId
     * @returns BlocklistResource Success
     * @throws ApiError
     */
    public static getApiV3BlocklistMovie(
        movieId?: number,
    ): CancelablePromise<Array<BlocklistResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/blocklist/movie',
            query: {
                'movieId': movieId,
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
