/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LogFileResource } from '../models/LogFileResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class LogFileService {
    /**
     * @returns LogFileResource Success
     * @throws ApiError
     */
    public static getApiV3LogFile(): CancelablePromise<Array<LogFileResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/log/file',
        });
    }
    /**
     * @param filename
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3LogFile1(
        filename: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/log/file/{filename}',
            path: {
                'filename': filename,
            },
        });
    }
}
