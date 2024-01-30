/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SeasonPassResource } from '../models/SeasonPassResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SeasonPassService {
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3Seasonpass(
        requestBody?: SeasonPassResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/seasonpass',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
