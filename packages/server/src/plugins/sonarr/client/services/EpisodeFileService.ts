/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeFileListResource } from '../models/EpisodeFileListResource';
import type { EpisodeFileResource } from '../models/EpisodeFileResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class EpisodeFileService {
    /**
     * @param seriesId
     * @param episodeFileIds
     * @returns EpisodeFileResource Success
     * @throws ApiError
     */
    public static getApiV3Episodefile(
        seriesId?: number,
        episodeFileIds?: Array<number>,
    ): CancelablePromise<Array<EpisodeFileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/episodefile',
            query: {
                'seriesId': seriesId,
                'episodeFileIds': episodeFileIds,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns EpisodeFileResource Success
     * @throws ApiError
     */
    public static putApiV3Episodefile(
        id: string,
        requestBody?: EpisodeFileResource,
    ): CancelablePromise<EpisodeFileResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/episodefile/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Episodefile(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/episodefile/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns EpisodeFileResource Success
     * @throws ApiError
     */
    public static getApiV3Episodefile1(
        id: number,
    ): CancelablePromise<EpisodeFileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/episodefile/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putApiV3EpisodefileEditor(
        requestBody?: EpisodeFileListResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/episodefile/editor',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3EpisodefileBulk(
        requestBody?: EpisodeFileListResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/episodefile/bulk',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putApiV3EpisodefileBulk(
        requestBody?: Array<EpisodeFileResource>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/episodefile/bulk',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
