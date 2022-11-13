/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DownloadClientResource } from '../models/DownloadClientResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DownloadClientService {

    /**
     * @returns DownloadClientResource Success
     * @throws ApiError
     */
    public static getApiV3Downloadclient(): CancelablePromise<Array<DownloadClientResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/downloadclient',
        });
    }

    /**
     * @param requestBody
     * @returns DownloadClientResource Success
     * @throws ApiError
     */
    public static postApiV3Downloadclient(
        requestBody?: DownloadClientResource,
    ): CancelablePromise<DownloadClientResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/downloadclient',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns DownloadClientResource Success
     * @throws ApiError
     */
    public static putApiV3Downloadclient(
        id: string,
        requestBody?: DownloadClientResource,
    ): CancelablePromise<DownloadClientResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/downloadclient/{id}',
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
    public static deleteApiV3Downloadclient(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/downloadclient/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns DownloadClientResource Success
     * @throws ApiError
     */
    public static getApiV3Downloadclient1(
        id: number,
    ): CancelablePromise<DownloadClientResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/downloadclient/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns DownloadClientResource Success
     * @throws ApiError
     */
    public static getApiV3DownloadclientSchema(): CancelablePromise<Array<DownloadClientResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/downloadclient/schema',
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3DownloadclientTest(
        requestBody?: DownloadClientResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/downloadclient/test',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3DownloadclientTestall(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/downloadclient/testall',
        });
    }

    /**
     * @param name
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3DownloadclientAction(
        name: string,
        requestBody?: DownloadClientResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/downloadclient/action/{name}',
            path: {
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}