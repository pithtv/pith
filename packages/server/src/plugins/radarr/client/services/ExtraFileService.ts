/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtraFileResource } from '../models/ExtraFileResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ExtraFileService {

    /**
     * @param movieId
     * @returns ExtraFileResource Success
     * @throws ApiError
     */
    public static getApiV3Extrafile(
        movieId?: number,
    ): CancelablePromise<Array<ExtraFileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/extrafile',
            query: {
                'movieId': movieId,
            },
        });
    }

}
