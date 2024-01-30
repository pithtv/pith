/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RemotePathMappingResource } from '../models/RemotePathMappingResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RemotePathMappingService {
    /**
     * @param requestBody
     * @returns RemotePathMappingResource Success
     * @throws ApiError
     */
    public static postApiV3Remotepathmapping(
        requestBody?: RemotePathMappingResource,
    ): CancelablePromise<RemotePathMappingResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/remotepathmapping',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns RemotePathMappingResource Success
     * @throws ApiError
     */
    public static getApiV3Remotepathmapping(): CancelablePromise<Array<RemotePathMappingResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/remotepathmapping',
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Remotepathmapping(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/remotepathmapping/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns RemotePathMappingResource Success
     * @throws ApiError
     */
    public static putApiV3Remotepathmapping(
        id: string,
        requestBody?: RemotePathMappingResource,
    ): CancelablePromise<RemotePathMappingResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/remotepathmapping/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns RemotePathMappingResource Success
     * @throws ApiError
     */
    public static getApiV3Remotepathmapping1(
        id: number,
    ): CancelablePromise<RemotePathMappingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/remotepathmapping/{id}',
            path: {
                'id': id,
            },
        });
    }
}
