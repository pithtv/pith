/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RootFolderResource } from '../models/RootFolderResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class RootFolderService {

    /**
     * @param requestBody
     * @returns RootFolderResource Success
     * @throws ApiError
     */
    public static postApiV3Rootfolder(
        requestBody?: RootFolderResource,
    ): CancelablePromise<RootFolderResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/rootfolder',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns RootFolderResource Success
     * @throws ApiError
     */
    public static getApiV3Rootfolder(): CancelablePromise<Array<RootFolderResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/rootfolder',
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Rootfolder(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/rootfolder/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns RootFolderResource Success
     * @throws ApiError
     */
    public static getApiV3Rootfolder1(
        id: number,
    ): CancelablePromise<RootFolderResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/rootfolder/{id}',
            path: {
                'id': id,
            },
        });
    }

}
