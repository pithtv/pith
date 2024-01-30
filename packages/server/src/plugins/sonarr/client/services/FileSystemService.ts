/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FileSystemService {
    /**
     * @param path
     * @param includeFiles
     * @param allowFoldersWithoutTrailingSlashes
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3Filesystem(
        path?: string,
        includeFiles: boolean = false,
        allowFoldersWithoutTrailingSlashes: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/filesystem',
            query: {
                'path': path,
                'includeFiles': includeFiles,
                'allowFoldersWithoutTrailingSlashes': allowFoldersWithoutTrailingSlashes,
            },
        });
    }
    /**
     * @param path
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3FilesystemType(
        path?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/filesystem/type',
            query: {
                'path': path,
            },
        });
    }
    /**
     * @param path
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3FilesystemMediafiles(
        path?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/filesystem/mediafiles',
            query: {
                'path': path,
            },
        });
    }
}
