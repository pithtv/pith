/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeResource } from '../models/EpisodeResource';
import type { EpisodesMonitoredResource } from '../models/EpisodesMonitoredResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EpisodeService {
    /**
     * @param seriesId
     * @param seasonNumber
     * @param episodeIds
     * @param episodeFileId
     * @param includeImages
     * @returns EpisodeResource Success
     * @throws ApiError
     */
    public static getApiV3Episode(
        seriesId?: number,
        seasonNumber?: number,
        episodeIds?: Array<number>,
        episodeFileId?: number,
        includeImages: boolean = false,
    ): CancelablePromise<Array<EpisodeResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/episode',
            query: {
                'seriesId': seriesId,
                'seasonNumber': seasonNumber,
                'episodeIds': episodeIds,
                'episodeFileId': episodeFileId,
                'includeImages': includeImages,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns EpisodeResource Success
     * @throws ApiError
     */
    public static putApiV3Episode(
        id: number,
        requestBody?: EpisodeResource,
    ): CancelablePromise<EpisodeResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/episode/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns EpisodeResource Success
     * @throws ApiError
     */
    public static getApiV3Episode1(
        id: number,
    ): CancelablePromise<EpisodeResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/episode/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param includeImages
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putApiV3EpisodeMonitor(
        includeImages: boolean = false,
        requestBody?: EpisodesMonitoredResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/episode/monitor',
            query: {
                'includeImages': includeImages,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
