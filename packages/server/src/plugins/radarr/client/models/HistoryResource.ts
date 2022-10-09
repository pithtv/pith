/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomFormatResource } from './CustomFormatResource';
import type { Language } from './Language';
import type { MovieHistoryEventType } from './MovieHistoryEventType';
import type { MovieResource } from './MovieResource';
import type { QualityModel } from './QualityModel';

export type HistoryResource = {
    id?: number;
    movieId?: number;
    sourceTitle?: string | null;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    qualityCutoffNotMet?: boolean;
    date?: string;
    downloadId?: string | null;
    eventType?: MovieHistoryEventType;
    data?: Record<string, string | null> | null;
    movie?: MovieResource;
};

