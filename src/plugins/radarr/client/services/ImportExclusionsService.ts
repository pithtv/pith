/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportExclusionsResource } from '../models/ImportExclusionsResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ImportExclusionsService {

    /**
     * @returns ImportExclusionsResource Success
     * @throws ApiError
     */
    public static getApiV3Exclusions(): CancelablePromise<Array<ImportExclusionsResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/exclusions',
        });
    }

    /**
     * @param requestBody
     * @returns ImportExclusionsResource Success
     * @throws ApiError
     */
    public static postApiV3Exclusions(
        requestBody?: ImportExclusionsResource,
    ): CancelablePromise<ImportExclusionsResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/exclusions',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns ImportExclusionsResource Success
     * @throws ApiError
     */
    public static putApiV3Exclusions(
        id: string,
        requestBody?: ImportExclusionsResource,
    ): CancelablePromise<ImportExclusionsResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/exclusions/{id}',
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
    public static deleteApiV3Exclusions(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/exclusions/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns ImportExclusionsResource Success
     * @throws ApiError
     */
    public static getApiV3Exclusions1(
        id: number,
    ): CancelablePromise<ImportExclusionsResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/exclusions/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3ExclusionsBulk(
        requestBody?: Array<ImportExclusionsResource>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/exclusions/bulk',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
