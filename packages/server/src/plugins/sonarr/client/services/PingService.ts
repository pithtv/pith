/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PingResource } from '../models/PingResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class PingService {
    /**
     * @returns PingResource Success
     * @throws ApiError
     */
    public static getPing(): CancelablePromise<PingResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/ping',
        });
    }
}
