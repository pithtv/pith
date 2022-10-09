/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MovieEditorResource } from '../models/MovieEditorResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MovieEditorService {

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putApiV3MovieEditor(
        requestBody?: MovieEditorResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/movie/editor',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3MovieEditor(
        requestBody?: MovieEditorResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/movie/editor',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
