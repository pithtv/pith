/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ColonReplacementFormat } from '../models/ColonReplacementFormat';
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
     * @param renameMovies
     * @param replaceIllegalCharacters
     * @param colonReplacementFormat
     * @param standardMovieFormat
     * @param movieFolderFormat
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
        renameMovies?: boolean,
        replaceIllegalCharacters?: boolean,
        colonReplacementFormat?: ColonReplacementFormat,
        standardMovieFormat?: string,
        movieFolderFormat?: string,
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
                'RenameMovies': renameMovies,
                'ReplaceIllegalCharacters': replaceIllegalCharacters,
                'ColonReplacementFormat': colonReplacementFormat,
                'StandardMovieFormat': standardMovieFormat,
                'MovieFolderFormat': movieFolderFormat,
                'IncludeQuality': includeQuality,
                'ReplaceSpaces': replaceSpaces,
                'Separator': separator,
                'NumberStyle': numberStyle,
                'Id': id,
                'ResourceName': resourceName,
            },
        });
    }

}
