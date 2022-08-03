/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MovieRuntimeFormatType } from './MovieRuntimeFormatType';

export type UiConfigResource = {
    id?: number;
    firstDayOfWeek?: number;
    calendarWeekColumnHeader?: string | null;
    movieRuntimeFormat?: MovieRuntimeFormatType;
    shortDateFormat?: string | null;
    longDateFormat?: string | null;
    timeFormat?: string | null;
    showRelativeDates?: boolean;
    enableColorImpairedMode?: boolean;
    movieInfoLanguage?: number;
    uiLanguage?: number;
};

