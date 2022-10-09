/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QueueResource } from '../models/QueueResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QueueDetailsService {

    /**
     * @param movieId
     * @param includeMovie
     * @returns QueueResource Success
     * @throws ApiError
     */
    public static getApiV3QueueDetails(
        movieId?: number,
        includeMovie: boolean = false,
    ): CancelablePromise<Array<QueueResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue/details',
            query: {
                'movieId': movieId,
                'includeMovie': includeMovie,
            },
        });
    }

    /**
     * @param id
     * @returns QueueResource Success
     * @throws ApiError
     */
    public static getApiV3QueueDetails1(
        id: number,
    ): CancelablePromise<QueueResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue/details/{id}',
            path: {
                'id': id,
            },
        });
    }

}
