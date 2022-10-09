/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MediaManagementConfigResource } from '../models/MediaManagementConfigResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MediaManagementConfigService {

    /**
     * @returns MediaManagementConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigMediamanagement(): CancelablePromise<MediaManagementConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/mediamanagement',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns MediaManagementConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigMediamanagement(
        id: string,
        requestBody?: MediaManagementConfigResource,
    ): CancelablePromise<MediaManagementConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/mediamanagement/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns MediaManagementConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigMediamanagement1(
        id: number,
    ): CancelablePromise<MediaManagementConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/mediamanagement/{id}',
            path: {
                'id': id,
            },
        });
    }

}
