/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QueueBulkResource } from '../models/QueueBulkResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class QueueActionService {

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3QueueGrab(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/queue/grab/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3QueueGrabBulk(
        requestBody?: QueueBulkResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/queue/grab/bulk',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
