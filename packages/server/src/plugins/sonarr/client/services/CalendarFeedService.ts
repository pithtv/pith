/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class CalendarFeedService {
    /**
     * @param pastDays
     * @param futureDays
     * @param tags
     * @param unmonitored
     * @param premieresOnly
     * @param asAllDay
     * @returns any Success
     * @throws ApiError
     */
    public static getFeedV3CalendarSonarrIcs(
        pastDays: number = 7,
        futureDays: number = 28,
        tags: string = '',
        unmonitored: boolean = false,
        premieresOnly: boolean = false,
        asAllDay: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feed/v3/calendar/sonarr.ics',
            query: {
                'pastDays': pastDays,
                'futureDays': futureDays,
                'tags': tags,
                'unmonitored': unmonitored,
                'premieresOnly': premieresOnly,
                'asAllDay': asAllDay,
            },
        });
    }
}
