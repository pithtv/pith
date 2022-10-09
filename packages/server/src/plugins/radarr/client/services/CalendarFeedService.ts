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
     * @param tagList
     * @param unmonitored
     * @returns any Success
     * @throws ApiError
     */
    public static getFeedV3CalendarRadarrIcs(
        pastDays: number = 7,
        futureDays: number = 28,
        tagList: string = '',
        unmonitored: boolean = false,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feed/v3/calendar/radarr.ics',
            query: {
                'pastDays': pastDays,
                'futureDays': futureDays,
                'tagList': tagList,
                'unmonitored': unmonitored,
            },
        });
    }

}
