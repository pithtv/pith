/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HealthResource } from '../models/HealthResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HealthService {

    /**
     * @returns HealthResource Success
     * @throws ApiError
     */
    public static getApiV3Health(): CancelablePromise<Array<HealthResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/health',
        });
    }

    /**
     * @param id
     * @returns HealthResource Success
     * @throws ApiError
     */
    public static getApiV3Health1(
        id: number,
    ): CancelablePromise<HealthResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/health/{id}',
            path: {
                'id': id,
            },
        });
    }

}