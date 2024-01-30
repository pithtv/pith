/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReleaseProfileResource } from '../models/ReleaseProfileResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReleaseProfileService {
    /**
     * @param requestBody
     * @returns ReleaseProfileResource Success
     * @throws ApiError
     */
    public static postApiV3Releaseprofile(
        requestBody?: ReleaseProfileResource,
    ): CancelablePromise<ReleaseProfileResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/releaseprofile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns ReleaseProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Releaseprofile(): CancelablePromise<Array<ReleaseProfileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/releaseprofile',
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Releaseprofile(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/releaseprofile/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns ReleaseProfileResource Success
     * @throws ApiError
     */
    public static putApiV3Releaseprofile(
        id: string,
        requestBody?: ReleaseProfileResource,
    ): CancelablePromise<ReleaseProfileResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/releaseprofile/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns ReleaseProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Releaseprofile1(
        id: number,
    ): CancelablePromise<ReleaseProfileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/releaseprofile/{id}',
            path: {
                'id': id,
            },
        });
    }
}
