/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeHistoryEventType } from '../models/EpisodeHistoryEventType';
import type { HistoryResource } from '../models/HistoryResource';
import type { HistoryResourcePagingResource } from '../models/HistoryResourcePagingResource';
import type { SortDirection } from '../models/SortDirection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HistoryService {
    /**
     * @param page
     * @param pageSize
     * @param sortKey
     * @param sortDirection
     * @param includeSeries
     * @param includeEpisode
     * @param eventType
     * @param episodeId
     * @param downloadId
     * @param seriesIds
     * @param languages
     * @param quality
     * @returns HistoryResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3History(
        page: number = 1,
        pageSize: number = 10,
        sortKey?: string,
        sortDirection?: SortDirection,
        includeSeries?: boolean,
        includeEpisode?: boolean,
        eventType?: Array<number>,
        episodeId?: number,
        downloadId?: string,
        seriesIds?: Array<number>,
        languages?: Array<number>,
        quality?: Array<number>,
    ): CancelablePromise<HistoryResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/history',
            query: {
                'page': page,
                'pageSize': pageSize,
                'sortKey': sortKey,
                'sortDirection': sortDirection,
                'includeSeries': includeSeries,
                'includeEpisode': includeEpisode,
                'eventType': eventType,
                'episodeId': episodeId,
                'downloadId': downloadId,
                'seriesIds': seriesIds,
                'languages': languages,
                'quality': quality,
            },
        });
    }
    /**
     * @param date
     * @param eventType
     * @param includeSeries
     * @param includeEpisode
     * @returns HistoryResource Success
     * @throws ApiError
     */
    public static getApiV3HistorySince(
        date?: string,
        eventType?: EpisodeHistoryEventType,
        includeSeries: boolean = false,
        includeEpisode: boolean = false,
    ): CancelablePromise<Array<HistoryResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/history/since',
            query: {
                'date': date,
                'eventType': eventType,
                'includeSeries': includeSeries,
                'includeEpisode': includeEpisode,
            },
        });
    }
    /**
     * @param seriesId
     * @param seasonNumber
     * @param eventType
     * @param includeSeries
     * @param includeEpisode
     * @returns HistoryResource Success
     * @throws ApiError
     */
    public static getApiV3HistorySeries(
        seriesId?: number,
        seasonNumber?: number,
        eventType?: EpisodeHistoryEventType,
        includeSeries: boolean = false,
        includeEpisode: boolean = false,
    ): CancelablePromise<Array<HistoryResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/history/series',
            query: {
                'seriesId': seriesId,
                'seasonNumber': seasonNumber,
                'eventType': eventType,
                'includeSeries': includeSeries,
                'includeEpisode': includeEpisode,
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
