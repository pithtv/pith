/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LogResourcePagingResource } from '../models/LogResourcePagingResource';
import type { SortDirection } from '../models/SortDirection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LogService {
    /**
     * @param page
     * @param pageSize
     * @param sortKey
     * @param sortDirection
     * @param level
     * @returns LogResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3Log(
        page: number = 1,
        pageSize: number = 10,
        sortKey?: string,
        sortDirection?: SortDirection,
        level?: string,
    ): CancelablePromise<LogResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/log',
            query: {
                'page': page,
                'pageSize': pageSize,
                'sortKey': sortKey,
                'sortDirection': sortDirection,
                'level': level,
            },
        });
    }
}
