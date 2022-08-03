/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaskResource } from '../models/TaskResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TaskService {

    /**
     * @returns TaskResource Success
     * @throws ApiError
     */
    public static getApiV3SystemTask(): CancelablePromise<Array<TaskResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/system/task',
        });
    }

    /**
     * @param id
     * @returns TaskResource Success
     * @throws ApiError
     */
    public static getApiV3SystemTask1(
        id: number,
    ): CancelablePromise<TaskResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/system/task/{id}',
            path: {
                'id': id,
            },
        });
    }

}
