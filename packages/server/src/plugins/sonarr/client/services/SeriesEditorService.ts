/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SeriesEditorResource } from '../models/SeriesEditorResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SeriesEditorService {
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putApiV3SeriesEditor(
        requestBody?: SeriesEditorResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/series/editor',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3SeriesEditor(
        requestBody?: SeriesEditorResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/series/editor',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
