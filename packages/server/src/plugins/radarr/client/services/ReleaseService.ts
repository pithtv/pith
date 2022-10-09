/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReleaseResource } from '../models/ReleaseResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ReleaseService {

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3Release(
        requestBody?: ReleaseResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/release',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param movieId
     * @returns ReleaseResource Success
     * @throws ApiError
     */
    public static getApiV3Release(
        movieId?: number,
    ): CancelablePromise<Array<ReleaseResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/release',
            query: {
                'movieId': movieId,
            },
        });
    }

    /**
     * @param id
     * @returns ReleaseResource Success
     * @throws ApiError
     */
    public static getApiV3Release1(
        id: number,
    ): CancelablePromise<ReleaseResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/release/{id}',
            path: {
                'id': id,
            },
        });
    }

}
