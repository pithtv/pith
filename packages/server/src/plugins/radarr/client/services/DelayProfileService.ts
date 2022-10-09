/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DelayProfileResource } from '../models/DelayProfileResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DelayProfileService {

    /**
     * @param requestBody
     * @returns DelayProfileResource Success
     * @throws ApiError
     */
    public static postApiV3Delayprofile(
        requestBody?: DelayProfileResource,
    ): CancelablePromise<DelayProfileResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/delayprofile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns DelayProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Delayprofile(): CancelablePromise<Array<DelayProfileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/delayprofile',
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Delayprofile(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/delayprofile/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns DelayProfileResource Success
     * @throws ApiError
     */
    public static putApiV3Delayprofile(
        id: string,
        requestBody?: DelayProfileResource,
    ): CancelablePromise<DelayProfileResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/delayprofile/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns DelayProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Delayprofile1(
        id: number,
    ): CancelablePromise<DelayProfileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/delayprofile/{id}',
            path: {
                'id': id,
            },
        });
    }

}
