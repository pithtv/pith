/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IndexerFlagResource } from '../models/IndexerFlagResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class IndexerFlagService {

    /**
     * @returns IndexerFlagResource Success
     * @throws ApiError
     */
    public static getApiV3Indexerflag(): CancelablePromise<Array<IndexerFlagResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/indexerflag',
        });
    }

}
