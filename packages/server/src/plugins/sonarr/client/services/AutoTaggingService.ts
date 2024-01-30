/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AutoTaggingResource } from '../models/AutoTaggingResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AutoTaggingService {
    /**
     * @param requestBody
     * @returns AutoTaggingResource Success
     * @throws ApiError
     */
    public static postApiV3Autotagging(
        requestBody?: AutoTaggingResource,
    ): CancelablePromise<AutoTaggingResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/autotagging',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AutoTaggingResource Success
     * @throws ApiError
     */
    public static getApiV3Autotagging(): CancelablePromise<Array<AutoTaggingResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/autotagging',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns AutoTaggingResource Success
     * @throws ApiError
     */
    public static putApiV3Autotagging(
        id: string,
        requestBody?: AutoTaggingResource,
    ): CancelablePromise<AutoTaggingResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/autotagging/{id}',
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
    public static deleteApiV3Autotagging(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/autotagging/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns AutoTaggingResource Success
     * @throws ApiError
     */
    public static getApiV3Autotagging1(
        id: number,
    ): CancelablePromise<AutoTaggingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/autotagging/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3AutotaggingSchema(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/autotagging/schema',
        });
    }
}
