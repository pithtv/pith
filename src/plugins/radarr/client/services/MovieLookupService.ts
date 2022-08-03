/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MovieResource } from '../models/MovieResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MovieLookupService {

    /**
     * @param tmdbId
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3MovieLookupTmdb(
        tmdbId?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/movie/lookup/tmdb',
            query: {
                'tmdbId': tmdbId,
            },
        });
    }

    /**
     * @param imdbId
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3MovieLookupImdb(
        imdbId?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/movie/lookup/imdb',
            query: {
                'imdbId': imdbId,
            },
        });
    }

    /**
     * @param term
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3MovieLookup(
        term?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/movie/lookup',
            query: {
                'term': term,
            },
        });
    }

    /**
     * @param id
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static getApiV3MovieLookup1(
        id: number,
    ): CancelablePromise<MovieResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/movie/lookup/{id}',
            path: {
                'id': id,
            },
        });
    }

}
