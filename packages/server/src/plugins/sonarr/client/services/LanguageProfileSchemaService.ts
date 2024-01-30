/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LanguageProfileResource } from '../models/LanguageProfileResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LanguageProfileSchemaService {
    /**
     * @deprecated
     * @returns LanguageProfileResource Success
     * @throws ApiError
     */
    public static getApiV3LanguageprofileSchema(): CancelablePromise<LanguageProfileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/languageprofile/schema',
        });
    }
}
