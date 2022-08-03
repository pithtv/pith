/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MovieResource } from '../models/MovieResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ImportListMoviesService {

    /**
     * @param includeRecommendations
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3ImportlistMovie(
        includeRecommendations: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/importlist/movie',
            query: {
                'includeRecommendations': includeRecommendations,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3ImportlistMovie(
        requestBody?: Array<MovieResource>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/importlist/movie',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
