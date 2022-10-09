/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BackupResource } from '../models/BackupResource';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BackupService {

    /**
     * @returns BackupResource Success
     * @throws ApiError
     */
    public static getApiV3SystemBackup(): CancelablePromise<Array<BackupResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/system/backup',
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3SystemBackup(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/system/backup/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3SystemBackupRestore(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/system/backup/restore/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3SystemBackupRestoreUpload(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/system/backup/restore/upload',
        });
    }

}
