/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class MediaCoverService {
    /**
     * @param seriesId
     * @param filename
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3Mediacover(
        seriesId: number,
        filename: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/mediacover/{seriesId}/{filename}',
            path: {
                'seriesId': seriesId,
                'filename': filename,
            },
        });
    }
}
