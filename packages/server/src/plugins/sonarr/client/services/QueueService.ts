/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DownloadProtocol } from '../models/DownloadProtocol';
import type { QueueBulkResource } from '../models/QueueBulkResource';
import type { QueueResourcePagingResource } from '../models/QueueResourcePagingResource';
import type { SortDirection } from '../models/SortDirection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class QueueService {
    /**
     * @param id
     * @param removeFromClient
     * @param blocklist
     * @param skipRedownload
     * @param changeCategory
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Queue(
        id: number,
        removeFromClient: boolean = true,
        blocklist: boolean = false,
        skipRedownload: boolean = false,
        changeCategory: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/queue/{id}',
            path: {
                'id': id,
            },
            query: {
                'removeFromClient': removeFromClient,
                'blocklist': blocklist,
                'skipRedownload': skipRedownload,
                'changeCategory': changeCategory,
            },
        });
    }
    /**
     * @param removeFromClient
     * @param blocklist
     * @param skipRedownload
     * @param changeCategory
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3QueueBulk(
        removeFromClient: boolean = true,
        blocklist: boolean = false,
        skipRedownload: boolean = false,
        changeCategory: boolean = false,
        requestBody?: QueueBulkResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/queue/bulk',
            query: {
                'removeFromClient': removeFromClient,
                'blocklist': blocklist,
                'skipRedownload': skipRedownload,
                'changeCategory': changeCategory,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param page
     * @param pageSize
     * @param sortKey
     * @param sortDirection
     * @param includeUnknownSeriesItems
     * @param includeSeries
     * @param includeEpisode
     * @param seriesIds
     * @param protocol
     * @param languages
     * @param quality
     * @returns QueueResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3Queue(
        page: number = 1,
        pageSize: number = 10,
        sortKey?: string,
        sortDirection?: SortDirection,
        includeUnknownSeriesItems: boolean = false,
        includeSeries: boolean = false,
        includeEpisode: boolean = false,
        seriesIds?: Array<number>,
        protocol?: DownloadProtocol,
        languages?: Array<number>,
        quality?: number,
    ): CancelablePromise<QueueResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue',
            query: {
                'page': page,
                'pageSize': pageSize,
                'sortKey': sortKey,
                'sortDirection': sortDirection,
                'includeUnknownSeriesItems': includeUnknownSeriesItems,
                'includeSeries': includeSeries,
                'includeEpisode': includeEpisode,
                'seriesIds': seriesIds,
                'protocol': protocol,
                'languages': languages,
                'quality': quality,
            },
        });
    }
}
