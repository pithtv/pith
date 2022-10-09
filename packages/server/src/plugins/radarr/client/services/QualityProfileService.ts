/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QualityProfileResource } from '../models/QualityProfileResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QualityProfileService {

    /**
     * @param requestBody
     * @returns QualityProfileResource Success
     * @throws ApiError
     */
    public static postApiV3Qualityprofile(
        requestBody?: QualityProfileResource,
    ): CancelablePromise<QualityProfileResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/qualityprofile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns QualityProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Qualityprofile(): CancelablePromise<Array<QualityProfileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/qualityprofile',
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Qualityprofile(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/qualityprofile/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns QualityProfileResource Success
     * @throws ApiError
     */
    public static putApiV3Qualityprofile(
        id: string,
        requestBody?: QualityProfileResource,
    ): CancelablePromise<QualityProfileResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/qualityprofile/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns QualityProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Qualityprofile1(
        id: number,
    ): CancelablePromise<QualityProfileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/qualityprofile/{id}',
            path: {
                'id': id,
            },
        });
    }

}
