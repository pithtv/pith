/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MetadataConfigResource } from '../models/MetadataConfigResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class MetadataConfigService {

    /**
     * @returns MetadataConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigMetadata(): CancelablePromise<MetadataConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/metadata',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns MetadataConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigMetadata(
        id: string,
        requestBody?: MetadataConfigResource,
    ): CancelablePromise<MetadataConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/metadata/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns MetadataConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigMetadata1(
        id: number,
    ): CancelablePromise<MetadataConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/metadata/{id}',
            path: {
                'id': id,
            },
        });
    }

}
