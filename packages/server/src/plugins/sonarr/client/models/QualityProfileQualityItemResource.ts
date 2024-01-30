/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Quality } from './Quality';
export type QualityProfileQualityItemResource = {
    id?: number;
    name?: string | null;
    quality?: Quality;
    items?: Array<QualityProfileQualityItemResource> | null;
    allowed?: boolean;
};

