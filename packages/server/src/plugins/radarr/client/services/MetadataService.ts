/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MetadataResource } from '../models/MetadataResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MetadataService {

    /**
     * @returns MetadataResource Success
     * @throws ApiError
     */
    public static getApiV3Metadata(): CancelablePromise<Array<MetadataResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/metadata',
        });
    }

    /**
     * @param requestBody
     * @returns MetadataResource Success
     * @throws ApiError
     */
    public static postApiV3Metadata(
        requestBody?: MetadataResource,
    ): CancelablePromise<MetadataResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/metadata',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns MetadataResource Success
     * @throws ApiError
     */
    public static putApiV3Metadata(
        id: string,
        requestBody?: MetadataResource,
    ): CancelablePromise<MetadataResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/metadata/{id}',
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
    public static deleteApiV3Metadata(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/metadata/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns MetadataResource Success
     * @throws ApiError
     */
    public static getApiV3Metadata1(
        id: number,
    ): CancelablePromise<MetadataResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/metadata/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns MetadataResource Success
     * @throws ApiError
     */
    public static getApiV3MetadataSchema(): CancelablePromise<Array<MetadataResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/metadata/schema',
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3MetadataTest(
        requestBody?: MetadataResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/metadata/test',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3MetadataTestall(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/metadata/testall',
        });
    }

    /**
     * @param name
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3MetadataAction(
        name: string,
        requestBody?: MetadataResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/metadata/action/{name}',
            path: {
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
