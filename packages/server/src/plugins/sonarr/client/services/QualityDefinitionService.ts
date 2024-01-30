/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { QualityDefinitionResource } from '../models/QualityDefinitionResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class QualityDefinitionService {
    /**
     * @param id
     * @param requestBody
     * @returns QualityDefinitionResource Success
     * @throws ApiError
     */
    public static putApiV3Qualitydefinition(
        id: string,
        requestBody?: QualityDefinitionResource,
    ): CancelablePromise<QualityDefinitionResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/qualitydefinition/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns QualityDefinitionResource Success
     * @throws ApiError
     */
    public static getApiV3Qualitydefinition(
        id: number,
    ): CancelablePromise<QualityDefinitionResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/qualitydefinition/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns QualityDefinitionResource Success
     * @throws ApiError
     */
    public static getApiV3Qualitydefinition1(): CancelablePromise<Array<QualityDefinitionResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/qualitydefinition',
        });
    }
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static putApiV3QualitydefinitionUpdate(
        requestBody?: Array<QualityDefinitionResource>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/qualitydefinition/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
