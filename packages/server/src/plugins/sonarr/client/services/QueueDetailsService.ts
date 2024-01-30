/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QueueResource } from '../models/QueueResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class QueueDetailsService {
    /**
     * @param seriesId
     * @param episodeIds
     * @param includeSeries
     * @param includeEpisode
     * @returns QueueResource Success
     * @throws ApiError
     */
    public static getApiV3QueueDetails(
        seriesId?: number,
        episodeIds?: Array<number>,
        includeSeries: boolean = false,
        includeEpisode: boolean = false,
    ): CancelablePromise<Array<QueueResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue/details',
            query: {
                'seriesId': seriesId,
                'episodeIds': episodeIds,
                'includeSeries': includeSeries,
                'includeEpisode': includeEpisode,
            },
        });
    }
}
