/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from './CustomFormatResource';
import type { EpisodeHistoryEventType } from './EpisodeHistoryEventType';
import type { EpisodeResource } from './EpisodeResource';
import type { Language } from './Language';
import type { QualityModel } from './QualityModel';
import type { SeriesResource } from './SeriesResource';
export type HistoryResource = {
    id?: number;
    episodeId?: number;
    seriesId?: number;
    sourceTitle?: string | null;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    customFormatScore?: number;
    qualityCutoffNotMet?: boolean;
    date?: string;
    downloadId?: string | null;
    eventType?: EpisodeHistoryEventType;
    data?: Record<string, string | null> | null;
    episode?: EpisodeResource;
    series?: SeriesResource;
};

