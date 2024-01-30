/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UiConfigResource } from '../models/UiConfigResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UiConfigService {
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
    public static getApiV3ConfigUi(
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
    /**
     * @returns UiConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigUi1(): CancelablePromise<UiConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/ui',
        });
    }
}
