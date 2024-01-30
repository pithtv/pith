/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NotificationResource } from '../models/NotificationResource';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationService {
    /**
     * @returns NotificationResource Success
     * @throws ApiError
     */
    public static getApiV3Notification(): CancelablePromise<Array<NotificationResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/notification',
        });
    }
    /**
     * @param forceSave
     * @param requestBody
     * @returns NotificationResource Success
     * @throws ApiError
     */
    public static postApiV3Notification(
        forceSave: boolean = false,
        requestBody?: NotificationResource,
    ): CancelablePromise<NotificationResource> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/notification',
            query: {
                'forceSave': forceSave,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @param forceSave
     * @param requestBody
     * @returns NotificationResource Success
     * @throws ApiError
     */
    public static putApiV3Notification(
        id: string,
        forceSave: boolean = false,
        requestBody?: NotificationResource,
    ): CancelablePromise<NotificationResource> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v3/notification/{id}',
            path: {
                'id': id,
            },
            query: {
                'forceSave': forceSave,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns any Success
     * @throws ApiError
     */
    public static deleteApiV3Notification(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v3/notification/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @returns NotificationResource Success
     * @throws ApiError
     */
    public static getApiV3Notification1(
        id: number,
    ): CancelablePromise<NotificationResource> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/notification/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @returns NotificationResource Success
     * @throws ApiError
     */
    public static getApiV3NotificationSchema(): CancelablePromise<Array<NotificationResource>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v3/notification/schema',
        });
    }
    /**
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3NotificationTest(
        requestBody?: NotificationResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/notification/test',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3NotificationTestall(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/notification/testall',
        });
    }
    /**
     * @param name
     * @param requestBody
     * @returns any Success
     * @throws ApiError
     */
    public static postApiV3NotificationAction(
        name: string,
        requestBody?: NotificationResource,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v3/notification/action/{name}',
            path: {
                'name': name,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
