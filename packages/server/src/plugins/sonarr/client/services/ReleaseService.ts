/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReleaseResource } from '../models/ReleaseResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReleaseService {
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3Release(
        requestBody?: ReleaseResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/release',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param seriesId
     * @param episodeId
     * @param seasonNumber
     * @returns ReleaseResource Success
     * @throws ApiError
     */
    public static getApiV3Release(
        seriesId?: number,
        episodeId?: number,
        seasonNumber?: number,
    ): CancelablePromise<Array<ReleaseResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/release',
            query: {
                'seriesId': seriesId,
                'episodeId': episodeId,
                'seasonNumber': seasonNumber,
            },
        });
    }
}
