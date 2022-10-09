/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AlternativeTitleResource } from '../models/AlternativeTitleResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AlternativeTitleService {

    /**
     * @param movieId
     * @param movieMetadataId
     * @returns AlternativeTitleResource Success
     * @throws ApiError
     */
    public static getApiV3Alttitle(
        movieId?: number,
        movieMetadataId?: number,
    ): CancelablePromise<Array<AlternativeTitleResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/alttitle',
            query: {
                'movieId': movieId,
                'movieMetadataId': movieMetadataId,
            },
        });
    }

    /**
     * @param id
     * @returns AlternativeTitleResource Success
     * @throws ApiError
     */
    public static getApiV3Alttitle1(
        id: number,
    ): CancelablePromise<AlternativeTitleResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/alttitle/{id}',
            path: {
                'id': id,
            },
        });
    }

}
