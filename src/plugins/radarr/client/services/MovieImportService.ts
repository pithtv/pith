/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MovieResource } from '../models/MovieResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MovieImportService {

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3MovieImport(
        requestBody?: Array<MovieResource>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/movie/import',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns MovieResource Success
     * @throws ApiError
     */
    public static getApiV3MovieImport(
        id: number,
    ): CancelablePromise<MovieResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/movie/import/{id}',
            path: {
                'id': id,
            },
        });
    }

}
