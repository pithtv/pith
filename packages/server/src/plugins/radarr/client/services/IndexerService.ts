/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IndexerResource } from '../models/IndexerResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class IndexerService {

    /**
     * @returns IndexerResource Success
     * @throws ApiError
     */
    public static getApiV3Indexer(): CancelablePromise<Array<IndexerResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/indexer',
        });
    }

    /**
     * @param requestBody
     * @returns IndexerResource Success
     * @throws ApiError
     */
    public static postApiV3Indexer(
        requestBody?: IndexerResource,
    ): CancelablePromise<IndexerResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/indexer',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns IndexerResource Success
     * @throws ApiError
     */
    public static putApiV3Indexer(
        id: string,
        requestBody?: IndexerResource,
    ): CancelablePromise<IndexerResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/indexer/{id}',
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
    public static deleteApiV3Indexer(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/indexer/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns IndexerResource Success
     * @throws ApiError
     */
    public static getApiV3Indexer1(
        id: number,
    ): CancelablePromise<IndexerResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/indexer/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns IndexerResource Success
     * @throws ApiError
     */
    public static getApiV3IndexerSchema(): CancelablePromise<Array<IndexerResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/indexer/schema',
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3IndexerTest(
        requestBody?: IndexerResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/indexer/test',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3IndexerTestall(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/indexer/testall',
        });
    }

    /**
     * @param name
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3IndexerAction(
        name: string,
        requestBody?: IndexerResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/indexer/action/{name}',
            path: {
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
