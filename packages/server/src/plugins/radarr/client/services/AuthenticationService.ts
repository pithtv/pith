/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthenticationService {

    /**
     * @param returnUrl
     * @param formData
     * @returns any Success
     * @throws ApiError
     */
    public static postLogin(
        returnUrl?: string,
        formData?: {
            Username?: string;
            Password?: string;
            RememberMe?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/login',
            query: {
                'returnUrl': returnUrl,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static getLogout(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/logout',
        });
    }

}
