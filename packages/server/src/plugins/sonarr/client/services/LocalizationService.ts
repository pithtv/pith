/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LocalizationLanguageResource } from '../models/LocalizationLanguageResource';
import type { LocalizationResource } from '../models/LocalizationResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LocalizationService {
    /**
     * @returns LocalizationResource Success
     * @throws ApiError
     */
    public static getApiV3Localization(): CancelablePromise<LocalizationResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/localization',
        });
    }
    /**
     * @returns LocalizationLanguageResource Success
     * @throws ApiError
     */
    public static getApiV3LocalizationLanguage(): CancelablePromise<LocalizationLanguageResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/localization/language',
        });
    }
    /**
     * @param id
     * @returns LocalizationResource Success
     * @throws ApiError
     */
    public static getApiV3Localization1(
        id: number,
    ): CancelablePromise<LocalizationResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/localization/{id}',
            path: {
                'id': id,
            },
        });
    }
}
