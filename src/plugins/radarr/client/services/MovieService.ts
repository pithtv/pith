/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MovieResource } from '../models/MovieResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MovieService {

    /**
     * @param tmdbId
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static getApiV3Movie(
        tmdbId?: number,
    ): CancelablePromise<Array<MovieResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/movie',
            query: {
                'tmdbId': tmdbId,
            },
        });
    }

    /**
     * @param requestBody
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static postApiV3Movie(
        requestBody?: MovieResource,
    ): CancelablePromise<MovieResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/movie',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static putApiV3Movie(
        id: string,
        requestBody?: MovieResource,
    ): CancelablePromise<MovieResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/movie/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Movie(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/movie/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static getApiV3Movie1(
        id: number,
    ): CancelablePromise<MovieResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/movie/{id}',
            path: {
                'id': id,
            },
        });
    }

}
