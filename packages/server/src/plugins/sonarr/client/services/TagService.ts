/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TagResource } from '../models/TagResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TagService {
    /**
     * @returns TagResource Success
     * @throws ApiError
     */
    public static getApiV3Tag(): CancelablePromise<Array<TagResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/tag',
        });
    }
    /**
     * @param requestBody
     * @returns TagResource Success
     * @throws ApiError
     */
    public static postApiV3Tag(
        requestBody?: TagResource,
    ): CancelablePromise<TagResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/tag',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns TagResource Success
     * @throws ApiError
     */
    public static putApiV3Tag(
        id: string,
        requestBody?: TagResource,
    ): CancelablePromise<TagResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/tag/{id}',
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
    public static deleteApiV3Tag(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/tag/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns TagResource Success
     * @throws ApiError
     */
    public static getApiV3Tag1(
        id: number,
    ): CancelablePromise<TagResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/tag/{id}',
            path: {
                'id': id,
            },
        });
    }
}
