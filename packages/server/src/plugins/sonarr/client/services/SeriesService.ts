/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SeriesResource } from '../models/SeriesResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SeriesService {
    /**
     * @param tvdbId
     * @param includeSeasonImages
     * @returns SeriesResource Success
     * @throws ApiError
     */
    public static getApiV3Series(
        tvdbId?: number,
        includeSeasonImages: boolean = false,
    ): CancelablePromise<Array<SeriesResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/series',
            query: {
                'tvdbId': tvdbId,
                'includeSeasonImages': includeSeasonImages,
            },
        });
    }
    /**
     * @param requestBody
     * @returns SeriesResource Success
     * @throws ApiError
     */
    public static postApiV3Series(
        requestBody?: SeriesResource,
    ): CancelablePromise<SeriesResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/series',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param includeSeasonImages
     * @returns SeriesResource Success
     * @throws ApiError
     */
    public static getApiV3Series1(
        id: number,
        includeSeasonImages: boolean = false,
    ): CancelablePromise<SeriesResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/series/{id}',
            path: {
                'id': id,
            },
            query: {
                'includeSeasonImages': includeSeasonImages,
            },
        });
    }
    /**
     * @param id
     * @param moveFiles
     * @param requestBody
     * @returns SeriesResource Success
     * @throws ApiError
     */
    public static putApiV3Series(
        id: string,
        moveFiles: boolean = false,
        requestBody?: SeriesResource,
    ): CancelablePromise<SeriesResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/series/{id}',
            path: {
                'id': id,
            },
            query: {
                'moveFiles': moveFiles,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param deleteFiles
     * @param addImportListExclusion
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Series(
        id: number,
        deleteFiles: boolean = false,
        addImportListExclusion: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/series/{id}',
            path: {
                'id': id,
            },
            query: {
                'deleteFiles': deleteFiles,
                'addImportListExclusion': addImportListExclusion,
            },
        });
    }
}
