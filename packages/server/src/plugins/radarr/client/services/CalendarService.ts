/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MovieResource } from '../models/MovieResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CalendarService {

    /**
     * @param start
     * @param end
     * @param unmonitored
     * @param includeArtist
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static getApiV3Calendar(
        start?: string,
        end?: string,
        unmonitored: boolean = false,
        includeArtist: boolean = false,
    ): CancelablePromise<Array<MovieResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/calendar',
            query: {
                'start': start,
                'end': end,
                'unmonitored': unmonitored,
                'includeArtist': includeArtist,
            },
        });
    }

    /**
     * @param id
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static getApiV3Calendar1(
        id: number,
    ): CancelablePromise<MovieResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/calendar/{id}',
            path: {
                'id': id,
            },
        });
    }

}
