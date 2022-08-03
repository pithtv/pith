/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UiConfigResource } from '../models/UiConfigResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UiConfigService {

    /**
     * @returns UiConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigUi(): CancelablePromise<UiConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/ui',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns UiConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigUi(
        id: string,
        requestBody?: UiConfigResource,
    ): CancelablePromise<UiConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/ui/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns UiConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigUi1(
        id: number,
    ): CancelablePromise<UiConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/ui/{id}',
            path: {
                'id': id,
            },
        });
    }

}
