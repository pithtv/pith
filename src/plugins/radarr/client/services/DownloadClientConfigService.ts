/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DownloadClientConfigResource } from '../models/DownloadClientConfigResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DownloadClientConfigService {

    /**
     * @returns DownloadClientConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigDownloadclient(): CancelablePromise<DownloadClientConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/downloadclient',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns DownloadClientConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigDownloadclient(
        id: string,
        requestBody?: DownloadClientConfigResource,
    ): CancelablePromise<DownloadClientConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/downloadclient/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns DownloadClientConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigDownloadclient1(
        id: number,
    ): CancelablePromise<DownloadClientConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/downloadclient/{id}',
            path: {
                'id': id,
            },
        });
    }

}
