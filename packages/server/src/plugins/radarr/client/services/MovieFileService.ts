/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MovieFileListResource } from '../models/MovieFileListResource';
import type { MovieFileResource } from '../models/MovieFileResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MovieFileService {

    /**
     * @param movieId
     * @param movieFileIds
     * @returns MovieFileResource Success
     * @throws ApiError
     */
    public static getApiV3Moviefile(
        movieId?: number,
        movieFileIds?: Array<number>,
    ): CancelablePromise<Array<MovieFileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/moviefile',
            query: {
                'movieId': movieId,
                'movieFileIds': movieFileIds,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns MovieFileResource Success
     * @throws ApiError
     */
    public static putApiV3Moviefile(
        id: string,
        requestBody?: MovieFileResource,
    ): CancelablePromise<MovieFileResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/moviefile/{id}',
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
    public static deleteApiV3Moviefile(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/moviefile/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns MovieFileResource Success
     * @throws ApiError
     */
    public static getApiV3Moviefile1(
        id: number,
    ): CancelablePromise<MovieFileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/moviefile/{id}',
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
    public static putApiV3MoviefileEditor(
        requestBody?: MovieFileListResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/moviefile/editor',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3MoviefileBulk(
        requestBody?: MovieFileListResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/moviefile/bulk',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
