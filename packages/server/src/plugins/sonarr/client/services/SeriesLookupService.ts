/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SeriesLookupService {
    /**
     * @param term
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3SeriesLookup(
        term?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/series/lookup',
            query: {
                'term': term,
            },
        });
    }
}
