/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportListConfigResource } from '../models/ImportListConfigResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImportListConfigService {
    /**
     * @returns ImportListConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigImportlist(): CancelablePromise<ImportListConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/importlist',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns ImportListConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigImportlist(
        id: string,
        requestBody?: ImportListConfigResource,
    ): CancelablePromise<ImportListConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/importlist/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ImportListConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigImportlist1(
        id: number,
    ): CancelablePromise<ImportListConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/importlist/{id}',
            path: {
                'id': id,
            },
        });
    }
}
