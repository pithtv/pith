/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ReleaseResource } from '../models/ReleaseResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ReleasePushService {

    /**
     * @param requestBody
     * @returns ReleaseResource Success
     * @throws ApiError
     */
    public static postApiV3ReleasePush(
        requestBody?: ReleaseResource,
    ): CancelablePromise<Array<ReleaseResource>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/release/push',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @returns ReleaseResource Success
     * @throws ApiError
     */
    public static getApiV3ReleasePush(
        id: number,
    ): CancelablePromise<ReleaseResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/release/push/{id}',
            path: {
                'id': id,
            },
        });
    }

}
