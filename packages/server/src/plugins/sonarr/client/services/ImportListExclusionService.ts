/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportListExclusionResource } from '../models/ImportListExclusionResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ImportListExclusionService {
    /**
     * @returns ImportListExclusionResource Success
     * @throws ApiError
     */
    public static getApiV3Importlistexclusion(): CancelablePromise<Array<ImportListExclusionResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/importlistexclusion',
        });
    }
    /**
     * @param requestBody
     * @returns ImportListExclusionResource Success
     * @throws ApiError
     */
    public static postApiV3Importlistexclusion(
        requestBody?: ImportListExclusionResource,
    ): CancelablePromise<ImportListExclusionResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/importlistexclusion',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns ImportListExclusionResource Success
     * @throws ApiError
     */
    public static putApiV3Importlistexclusion(
        id: string,
        requestBody?: ImportListExclusionResource,
    ): CancelablePromise<ImportListExclusionResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/importlistexclusion/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Importlistexclusion(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/importlistexclusion/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns ImportListExclusionResource Success
     * @throws ApiError
     */
    public static getApiV3Importlistexclusion1(
        id: number,
    ): CancelablePromise<ImportListExclusionResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/importlistexclusion/{id}',
            path: {
                'id': id,
            },
        });
    }
}
