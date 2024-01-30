/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from './CustomFormatResource';
import type { EpisodeResource } from './EpisodeResource';
import type { Language } from './Language';
import type { ParsedEpisodeInfo } from './ParsedEpisodeInfo';
import type { SeriesResource } from './SeriesResource';
export type ParseResource = {
    id?: number;
    title?: string | null;
    parsedEpisodeInfo?: ParsedEpisodeInfo;
    series?: SeriesResource;
    episodes?: Array<EpisodeResource> | null;
    languages?: Array<Language> | null;
    customFormats?: Array<CustomFormatResource> | null;
    customFormatScore?: number;
};

