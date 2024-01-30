/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Language } from './Language';
import type { LanguageProfileItemResource } from './LanguageProfileItemResource';
export type LanguageProfileResource = {
    id?: number;
    name?: string | null;
    upgradeAllowed?: boolean;
    cutoff?: Language;
    languages?: Array<LanguageProfileItemResource> | null;
};

