/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LocalizationService {

    /**
     * @returns string Success
     * @throws ApiError
     */
    public static getApiV3Localization(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/localization',
        });
    }

}
