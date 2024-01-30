/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HostConfigResource } from '../models/HostConfigResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HostConfigService {
    /**
     * @returns HostConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigHost(): CancelablePromise<HostConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/host',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns HostConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigHost(
        id: string,
        requestBody?: HostConfigResource,
    ): CancelablePromise<HostConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/host/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns HostConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigHost1(
        id: number,
    ): CancelablePromise<HostConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/host/{id}',
            path: {
                'id': id,
            },
        });
    }
}
