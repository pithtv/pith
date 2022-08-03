/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ImportListResource } from '../models/ImportListResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ImportListService {

    /**
     * @returns ImportListResource Success
     * @throws ApiError
     */
    public static getApiV3Importlist(): CancelablePromise<Array<ImportListResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/importlist',
        });
    }

    /**
     * @param requestBody
     * @returns ImportListResource Success
     * @throws ApiError
     */
    public static postApiV3Importlist(
        requestBody?: ImportListResource,
    ): CancelablePromise<ImportListResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/importlist',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns ImportListResource Success
     * @throws ApiError
     */
    public static putApiV3Importlist(
        id: string,
        requestBody?: ImportListResource,
    ): CancelablePromise<ImportListResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/importlist/{id}',
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
    public static deleteApiV3Importlist(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/importlist/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns ImportListResource Success
     * @throws ApiError
     */
    public static getApiV3Importlist1(
        id: number,
    ): CancelablePromise<ImportListResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/importlist/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns ImportListResource Success
     * @throws ApiError
     */
    public static getApiV3ImportlistSchema(): CancelablePromise<Array<ImportListResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/importlist/schema',
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3ImportlistTest(
        requestBody?: ImportListResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/importlist/test',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3ImportlistTestall(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/importlist/testall',
        });
    }

    /**
     * @param name
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3ImportlistAction(
        name: string,
        requestBody?: ImportListResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/importlist/action/{name}',
            path: {
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
