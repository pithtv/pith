/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QueueBulkResource } from '../models/QueueBulkResource';
import type { QueueResource } from '../models/QueueResource';
import type { QueueResourcePagingResource } from '../models/QueueResourcePagingResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QueueService {

    /**
     * @param id
     * @param removeFromClient
     * @param blocklist
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Queue(
        id: number,
        removeFromClient: boolean = true,
        blocklist: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/queue/{id}',
            path: {
                'id': id,
            },
            query: {
                'removeFromClient': removeFromClient,
                'blocklist': blocklist,
            },
        });
    }

    /**
     * @param id
     * @returns QueueResource Success
     * @throws ApiError
     */
    public static getApiV3Queue(
        id: number,
    ): CancelablePromise<QueueResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param removeFromClient
     * @param blocklist
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3QueueBulk(
        removeFromClient: boolean = true,
        blocklist: boolean = false,
        requestBody?: QueueBulkResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/queue/bulk',
            query: {
                'removeFromClient': removeFromClient,
                'blocklist': blocklist,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param includeUnknownMovieItems
     * @param includeMovie
     * @returns QueueResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3Queue1(
        includeUnknownMovieItems: boolean = false,
        includeMovie: boolean = false,
    ): CancelablePromise<QueueResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue',
            query: {
                'includeUnknownMovieItems': includeUnknownMovieItems,
                'includeMovie': includeMovie,
            },
        });
    }

}
