/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HistoryResource } from '../models/HistoryResource';
import type { HistoryResourcePagingResource } from '../models/HistoryResourcePagingResource';
import type { MovieHistoryEventType } from '../models/MovieHistoryEventType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HistoryService {

    /**
     * @param includeMovie
     * @returns HistoryResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3History(
        includeMovie?: boolean,
    ): CancelablePromise<HistoryResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/history',
            query: {
                'includeMovie': includeMovie,
            },
        });
    }

    /**
     * @param date
     * @param eventType
     * @param includeMovie
     * @returns HistoryResource Success
     * @throws ApiError
     */
    public static getApiV3HistorySince(
        date?: string,
        eventType?: MovieHistoryEventType,
        includeMovie: boolean = false,
    ): CancelablePromise<Array<HistoryResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/history/since',
            query: {
                'date': date,
                'eventType': eventType,
                'includeMovie': includeMovie,
            },
        });
    }

    /**
     * @param movieId
     * @param eventType
     * @param includeMovie
     * @returns HistoryResource Success
     * @throws ApiError
     */
    public static getApiV3HistoryMovie(
        movieId?: number,
        eventType?: MovieHistoryEventType,
        includeMovie: boolean = false,
    ): CancelablePromise<Array<HistoryResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/history/movie',
            query: {
                'movieId': movieId,
                'eventType': eventType,
                'includeMovie': includeMovie,
            },
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3HistoryFailed(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/history/failed/{id}',
            path: {
                'id': id,
            },
        });
    }

}
