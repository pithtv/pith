/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LanguageProfileResource } from '../models/LanguageProfileResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LanguageProfileService {
    /**
     * @deprecated
     * @param requestBody
     * @returns LanguageProfileResource Success
     * @throws ApiError
     */
    public static postApiV3Languageprofile(
        requestBody?: LanguageProfileResource,
    ): CancelablePromise<LanguageProfileResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/languageprofile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @deprecated
     * @returns LanguageProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Languageprofile(): CancelablePromise<Array<LanguageProfileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/languageprofile',
        });
    }
    /**
     * @deprecated
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Languageprofile(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/languageprofile/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @deprecated
     * @param id
     * @param requestBody
     * @returns LanguageProfileResource Success
     * @throws ApiError
     */
    public static putApiV3Languageprofile(
        id: string,
        requestBody?: LanguageProfileResource,
    ): CancelablePromise<LanguageProfileResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/languageprofile/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns LanguageProfileResource Success
     * @throws ApiError
     */
    public static getApiV3Languageprofile1(
        id: number,
    ): CancelablePromise<LanguageProfileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/languageprofile/{id}',
            path: {
                'id': id,
            },
        });
    }
}
