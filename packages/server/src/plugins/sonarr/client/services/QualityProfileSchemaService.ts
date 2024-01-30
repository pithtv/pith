/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QualityProfileResource } from '../models/QualityProfileResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class QualityProfileSchemaService {
    /**
     * @returns QualityProfileResource Success
     * @throws ApiError
     */
    public static getApiV3QualityprofileSchema(): CancelablePromise<QualityProfileResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/qualityprofile/schema',
        });
    }
}
