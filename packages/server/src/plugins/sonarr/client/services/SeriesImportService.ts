/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SeriesResource } from '../models/SeriesResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SeriesImportService {
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3SeriesImport(
        requestBody?: Array<SeriesResource>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/series/import',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
