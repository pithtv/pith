/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { HealthCheckResult } from './HealthCheckResult';
import type { HttpUri } from './HttpUri';
export type HealthResource = {
    id?: number;
    source?: string | null;
    type?: HealthCheckResult;
    message?: string | null;
    wikiUrl?: HttpUri;
};

