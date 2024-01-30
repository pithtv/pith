/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NamingConfigResource } from '../models/NamingConfigResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NamingConfigService {
    /**
     * @returns NamingConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigNaming(): CancelablePromise<NamingConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/naming',
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns NamingConfigResource Success
     * @throws ApiError
     */
    public static putApiV3ConfigNaming(
        id: string,
        requestBody?: NamingConfigResource,
    ): CancelablePromise<NamingConfigResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/config/naming/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns NamingConfigResource Success
     * @throws ApiError
     */
    public static getApiV3ConfigNaming1(
        id: number,
    ): CancelablePromise<NamingConfigResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/naming/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param renameEpisodes
     * @param replaceIllegalCharacters
     * @param colonReplacementFormat
     * @param multiEpisodeStyle
     * @param standardEpisodeFormat
     * @param dailyEpisodeFormat
     * @param animeEpisodeFormat
     * @param seriesFolderFormat
     * @param seasonFolderFormat
     * @param specialsFolderFormat
     * @param includeSeriesTitle
     * @param includeEpisodeTitle
     * @param includeQuality
     * @param replaceSpaces
     * @param separator
     * @param numberStyle
     * @param id
     * @param resourceName
     * @returns any Success
     * @throws ApiError
     */
    public static getApiV3ConfigNamingExamples(
        renameEpisodes?: boolean,
        replaceIllegalCharacters?: boolean,
        colonReplacementFormat?: number,
        multiEpisodeStyle?: number,
        standardEpisodeFormat?: string,
        dailyEpisodeFormat?: string,
        animeEpisodeFormat?: string,
        seriesFolderFormat?: string,
        seasonFolderFormat?: string,
        specialsFolderFormat?: string,
        includeSeriesTitle?: boolean,
        includeEpisodeTitle?: boolean,
        includeQuality?: boolean,
        replaceSpaces?: boolean,
        separator?: string,
        numberStyle?: string,
        id?: number,
        resourceName?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/config/naming/examples',
            query: {
                'renameEpisodes': renameEpisodes,
                'replaceIllegalCharacters': replaceIllegalCharacters,
                'colonReplacementFormat': colonReplacementFormat,
                'multiEpisodeStyle': multiEpisodeStyle,
                'standardEpisodeFormat': standardEpisodeFormat,
                'dailyEpisodeFormat': dailyEpisodeFormat,
                'animeEpisodeFormat': animeEpisodeFormat,
                'seriesFolderFormat': seriesFolderFormat,
                'seasonFolderFormat': seasonFolderFormat,
                'specialsFolderFormat': specialsFolderFormat,
                'includeSeriesTitle': includeSeriesTitle,
                'includeEpisodeTitle': includeEpisodeTitle,
                'includeQuality': includeQuality,
                'replaceSpaces': replaceSpaces,
                'separator': separator,
                'numberStyle': numberStyle,
                'id': id,
                'resourceName': resourceName,
            },
        });
    }
}
