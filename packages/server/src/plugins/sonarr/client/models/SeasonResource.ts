/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MediaCover } from './MediaCover';
import type { SeasonStatisticsResource } from './SeasonStatisticsResource';
export type SeasonResource = {
    seasonNumber?: number;
    monitored?: boolean;
    statistics?: SeasonStatisticsResource;
    images?: Array<MediaCover> | null;
};

