/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFilterResource } from '../models/CustomFilterResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CustomFilterService {
    /**
     * @returns CustomFilterResource Success
     * @throws ApiError
     */
    public static getApiV3Customfilter(): CancelablePromise<Array<CustomFilterResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/customfilter',
        });
    }
    /**
     * @param requestBody
     * @returns CustomFilterResource Success
     * @throws ApiError
     */
    public static postApiV3Customfilter(
        requestBody?: CustomFilterResource,
    ): CancelablePromise<CustomFilterResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/customfilter',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns CustomFilterResource Success
     * @throws ApiError
     */
    public static putApiV3Customfilter(
        id: string,
        requestBody?: CustomFilterResource,
    ): CancelablePromise<CustomFilterResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/customfilter/{id}',
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
    public static deleteApiV3Customfilter(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/customfilter/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns CustomFilterResource Success
     * @throws ApiError
     */
    public static getApiV3Customfilter1(
        id: number,
    ): CancelablePromise<CustomFilterResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/customfilter/{id}',
            path: {
                'id': id,
            },
        });
    }
}
