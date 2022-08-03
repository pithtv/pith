/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TagDetailsResource } from '../models/TagDetailsResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TagDetailsService {

    /**
     * @returns TagDetailsResource Success
     * @throws ApiError
     */
    public static getApiV3TagDetail(): CancelablePromise<Array<TagDetailsResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/tag/detail',
        });
    }

    /**
     * @param id
     * @returns TagDetailsResource Success
     * @throws ApiError
     */
    public static getApiV3TagDetail1(
        id: number,
    ): CancelablePromise<TagDetailsResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/tag/detail/{id}',
            path: {
                'id': id,
            },
        });
    }

}
