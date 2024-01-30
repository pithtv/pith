/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateResource } from '../models/UpdateResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UpdateService {
    /**
     * @returns UpdateResource Success
     * @throws ApiError
     */
    public static getApiV3Update(): CancelablePromise<Array<UpdateResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/update',
        });
    }
}
