/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LogResourcePagingResource } from '../models/LogResourcePagingResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LogService {

    /**
     * @returns LogResourcePagingResource Success
     * @throws ApiError
     */
    public static getApiV3Log(): CancelablePromise<LogResourcePagingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/log',
        });
    }

}
