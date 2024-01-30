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
export class CutoffService {
    /**
     * @param page
     * @param pageSize
     * @param sortKey
     * @param sortDirection
     * @param includeSeries
     * @param includeEpisodeFile
     * @param includeImages
     * @param monitored
     * @returns EpisodeResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3WantedCutoff(
        page: number = 1,
        pageSize: number = 10,
        sortKey?: string,
        sortDirection?: SortDirection,
        includeSeries: boolean = false,
        includeEpisodeFile: boolean = false,
        includeImages: boolean = false,
        monitored: boolean = true,
    ): CancelablePromise<EpisodeResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/wanted/cutoff',
            query: {
                'page': page,
                'pageSize': pageSize,
                'sortKey': sortKey,
                'sortDirection': sortDirection,
                'includeSeries': includeSeries,
                'includeEpisodeFile': includeEpisodeFile,
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
    public static getApiV3WantedCutoff1(
        id: number,
    ): CancelablePromise<EpisodeResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/wanted/cutoff/{id}',
            path: {
                'id': id,
            },
        });
    }
}
