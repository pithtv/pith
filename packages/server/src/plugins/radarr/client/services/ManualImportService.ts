/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ManualImportReprocessResource } from '../models/ManualImportReprocessResource';
import type { ManualImportResource } from '../models/ManualImportResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ManualImportService {

    /**
     * @param folder
     * @param downloadId
     * @param movieId
     * @param filterExistingFiles
     * @returns ManualImportResource Success
     * @throws ApiError
     */
    public static getApiV3Manualimport(
        folder?: string,
        downloadId?: string,
        movieId?: number,
        filterExistingFiles: boolean = true,
    ): CancelablePromise<Array<ManualImportResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/manualimport',
            query: {
                'folder': folder,
                'downloadId': downloadId,
                'movieId': movieId,
                'filterExistingFiles': filterExistingFiles,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3Manualimport(
        requestBody?: Array<ManualImportReprocessResource>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/manualimport',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}