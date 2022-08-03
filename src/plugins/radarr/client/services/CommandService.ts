/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommandResource } from '../models/CommandResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class CommandService {

    /**
     * @param requestBody
     * @returns CommandResource Success
     * @throws ApiError
     */
    public static postApiV3Command(
        requestBody?: CommandResource,
    ): CancelablePromise<CommandResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/command',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns CommandResource Success
     * @throws ApiError
     */
    public static getApiV3Command(): CancelablePromise<Array<CommandResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/command',
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Command(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/command/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns CommandResource Success
     * @throws ApiError
     */
    public static getApiV3Command1(
        id: number,
    ): CancelablePromise<CommandResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/command/{id}',
            path: {
                'id': id,
            },
        });
    }

}
