/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SystemService {

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3SystemStatus(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/system/status',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3SystemRoutes(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/system/routes',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3SystemRoutesDuplicate(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/system/routes/duplicate',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3SystemShutdown(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/system/shutdown',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3SystemRestart(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/system/restart',
        });
    }

}
