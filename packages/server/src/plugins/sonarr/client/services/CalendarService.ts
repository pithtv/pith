/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeResource } from '../models/EpisodeResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CalendarService {
    /**
     * @param start
     * @param end
     * @param unmonitored
     * @param includeSeries
     * @param includeEpisodeFile
     * @param includeEpisodeImages
     * @param tags
     * @returns EpisodeResource Success
     * @throws ApiError
     */
    public static getApiV3Calendar(
        start?: string,
        end?: string,
        unmonitored: boolean = false,
        includeSeries: boolean = false,
        includeEpisodeFile: boolean = false,
        includeEpisodeImages: boolean = false,
        tags: string = '',
    ): CancelablePromise<Array<EpisodeResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/calendar',
            query: {
                'start': start,
                'end': end,
                'unmonitored': unmonitored,
                'includeSeries': includeSeries,
                'includeEpisodeFile': includeEpisodeFile,
                'includeEpisodeImages': includeEpisodeImages,
                'tags': tags,
            },
        });
    }
    /**
     * @param id
     * @returns EpisodeResource Success
     * @throws ApiError
     */
    public static getApiV3Calendar1(
        id: number,
    ): CancelablePromise<EpisodeResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/calendar/{id}',
            path: {
                'id': id,
            },
        });
    }
}
