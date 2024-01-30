/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DiskSpaceResource } from '../models/DiskSpaceResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DiskSpaceService {
    /**
     * @returns DiskSpaceResource Success
     * @throws ApiError
     */
    public static getApiV3Diskspace(): CancelablePromise<Array<DiskSpaceResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/diskspace',
        });
    }
}
