/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { RenameEpisodeResource } from '../models/RenameEpisodeResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RenameEpisodeService {
    /**
     * @param seriesId
     * @param seasonNumber
     * @returns RenameEpisodeResource Success
     * @throws ApiError
     */
    public static getApiV3Rename(
        seriesId?: number,
        seasonNumber?: number,
    ): CancelablePromise<Array<RenameEpisodeResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/rename',
            query: {
                'seriesId': seriesId,
                'seasonNumber': seasonNumber,
            },
        });
    }
}
