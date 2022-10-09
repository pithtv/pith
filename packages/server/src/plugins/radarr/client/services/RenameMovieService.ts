/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RenameMovieResource } from '../models/RenameMovieResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RenameMovieService {

    /**
     * @param movieId
     * @returns RenameMovieResource Success
     * @throws ApiError
     */
    public static getApiV3Rename(
        movieId?: number,
    ): CancelablePromise<Array<RenameMovieResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/rename',
            query: {
                'movieId': movieId,
            },
        });
    }

}
