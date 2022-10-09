/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CollectionResource } from '../models/CollectionResource';
import type { CollectionUpdateResource } from '../models/CollectionUpdateResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CollectionService {

    /**
     * @returns CollectionResource Success
     * @throws ApiError
     */
    public static getApiV3Collection(): CancelablePromise<Array<CollectionResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/collection',
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putApiV3Collection(
        requestBody?: CollectionUpdateResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/collection',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns CollectionResource Success
     * @throws ApiError
     */
    public static putApiV3Collection1(
        id: string,
        requestBody?: CollectionResource,
    ): CancelablePromise<CollectionResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/collection/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns CollectionResource Success
     * @throws ApiError
     */
    public static getApiV3Collection1(
        id: number,
    ): CancelablePromise<CollectionResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/collection/{id}',
            path: {
                'id': id,
            },
        });
    }

}
