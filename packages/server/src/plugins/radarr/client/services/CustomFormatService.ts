/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from '../models/CustomFormatResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CustomFormatService {

    /**
     * @param requestBody
     * @returns CustomFormatResource Success
     * @throws ApiError
     */
    public static postApiV3Customformat(
        requestBody?: CustomFormatResource,
    ): CancelablePromise<CustomFormatResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/customformat',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns CustomFormatResource Success
     * @throws ApiError
     */
    public static getApiV3Customformat(): CancelablePromise<Array<CustomFormatResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/customformat',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns CustomFormatResource Success
     * @throws ApiError
     */
    public static putApiV3Customformat(
        id: string,
        requestBody?: CustomFormatResource,
    ): CancelablePromise<CustomFormatResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/customformat/{id}',
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
    public static deleteApiV3Customformat(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/customformat/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns CustomFormatResource Success
     * @throws ApiError
     */
    public static getApiV3Customformat1(
        id: number,
    ): CancelablePromise<CustomFormatResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/customformat/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3CustomformatSchema(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/customformat/schema',
        });
    }

}
