/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ParseResource } from '../models/ParseResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ParseService {
    /**
     * @param title
     * @param path
     * @returns ParseResource Success
     * @throws ApiError
     */
    public static getApiV3Parse(
        title?: string,
        path?: string,
    ): CancelablePromise<ParseResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/parse',
            query: {
                'title': title,
                'path': path,
            },
        });
    }
}
