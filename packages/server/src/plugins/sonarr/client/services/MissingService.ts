/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeResource } from '../models/EpisodeResource';
import type { EpisodeResourcePagingResource } from '../models/EpisodeResourcePagingResource';
import type { SortDirection } from '../models/SortDirection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MissingService {
    /**
     * @param page
     * @param pageSize
     * @param sortKey
     * @param sortDirection
     * @param includeSeries
     * @param includeImages
     * @param monitored
     * @returns EpisodeResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3WantedMissing(
        page: number = 1,
        pageSize: number = 10,
        sortKey?: string,
        sortDirection?: SortDirection,
        includeSeries: boolean = false,
        includeImages: boolean = false,
        monitored: boolean = true,
    ): CancelablePromise<EpisodeResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/wanted/missing',
            query: {
                'page': page,
                'pageSize': pageSize,
                'sortKey': sortKey,
                'sortDirection': sortDirection,
                'includeSeries': includeSeries,
                'includeImages': includeImages,
                'monitored': monitored,
            },
        });
    }
    /**
     * @param id
     * @returns EpisodeResource Success
     * @throws ApiError
     */
    public static getApiV3WantedMissing1(
        id: number,
    ): CancelablePromise<EpisodeResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/wanted/missing/{id}',
            path: {
                'id': id,
            },
        });
    }
}
