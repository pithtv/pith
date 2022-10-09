/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class InitializeJsService {

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getInitializeJs(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/initialize.js',
        });
    }

}
