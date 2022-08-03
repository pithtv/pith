/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QueueStatusResource } from '../models/QueueStatusResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QueueStatusService {

    /**
     * @returns QueueStatusResource Success
     * @throws ApiError
     */
    public static getApiV3QueueStatus(): CancelablePromise<QueueStatusResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue/status',
        });
    }

    /**
     * @param id
     * @returns QueueStatusResource Success
     * @throws ApiError
     */
    public static getApiV3QueueStatus1(
        id: number,
    ): CancelablePromise<QueueStatusResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/queue/status/{id}',
            path: {
                'id': id,
            },
        });
    }

}
