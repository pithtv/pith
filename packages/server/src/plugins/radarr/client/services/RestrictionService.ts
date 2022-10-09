/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RestrictionResource } from '../models/RestrictionResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RestrictionService {

    /**
     * @returns RestrictionResource Success
     * @throws ApiError
     */
    public static getApiV3Restriction(): CancelablePromise<Array<RestrictionResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/restriction',
        });
    }

    /**
     * @param requestBody
     * @returns RestrictionResource Success
     * @throws ApiError
     */
    public static postApiV3Restriction(
        requestBody?: RestrictionResource,
    ): CancelablePromise<RestrictionResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/restriction',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns RestrictionResource Success
     * @throws ApiError
     */
    public static putApiV3Restriction(
        id: string,
        requestBody?: RestrictionResource,
    ): CancelablePromise<RestrictionResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/restriction/{id}',
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
    public static deleteApiV3Restriction(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/restriction/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns RestrictionResource Success
     * @throws ApiError
     */
    public static getApiV3Restriction1(
        id: number,
    ): CancelablePromise<RestrictionResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/restriction/{id}',
            path: {
                'id': id,
            },
        });
    }

}
