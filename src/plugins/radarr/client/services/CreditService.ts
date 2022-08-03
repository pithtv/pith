/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreditResource } from '../models/CreditResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CreditService {

    /**
     * @param movieId
     * @param movieMetadataId
     * @returns CreditResource Success
     * @throws ApiError
     */
    public static getApiV3Credit(
        movieId?: number,
        movieMetadataId?: number,
    ): CancelablePromise<Array<CreditResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/credit',
            query: {
                'movieId': movieId,
                'movieMetadataId': movieMetadataId,
            },
        });
    }

    /**
     * @param id
     * @returns CreditResource Success
     * @throws ApiError
     */
    public static getApiV3Credit1(
        id: number,
    ): CancelablePromise<CreditResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/credit/{id}',
            path: {
                'id': id,
            },
        });
    }

}
