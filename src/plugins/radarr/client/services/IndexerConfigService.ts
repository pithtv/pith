/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IndexerConfigResource } from '../models/IndexerConfigResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class IndexerConfigService {

    /**
     * @returns IndexerConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigIndexer(): CancelablePromise<IndexerConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/indexer',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns IndexerConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigIndexer(
        id: string,
        requestBody?: IndexerConfigResource,
    ): CancelablePromise<IndexerConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/indexer/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns IndexerConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigIndexer1(
        id: number,
    ): CancelablePromise<IndexerConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/indexer/{id}',
            path: {
                'id': id,
            },
        });
    }

}
