/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LanguageResource } from '../models/LanguageResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LanguageService {
    /**
     * @returns LanguageResource Success
     * @throws ApiError
     */
    public static getApiV3Language(): CancelablePromise<Array<LanguageResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/language',
        });
    }
    /**
     * @param id
     * @returns LanguageResource Success
     * @throws ApiError
     */
    public static getApiV3Language1(
        id: number,
    ): CancelablePromise<LanguageResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/language/{id}',
            path: {
                'id': id,
            },
        });
    }
}
