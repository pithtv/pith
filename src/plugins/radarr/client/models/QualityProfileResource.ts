/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Language } from './Language';
import type { ProfileFormatItemResource } from './ProfileFormatItemResource';
import type { QualityProfileQualityItemResource } from './QualityProfileQualityItemResource';

export type QualityProfileResource = {
    id?: number;
    name?: string | null;
    upgradeAllowed?: boolean;
    cutoff?: number;
    items?: Array<QualityProfileQualityItemResource> | null;
    minFormatScore?: number;
    cutoffFormatScore?: number;
    formatItems?: Array<ProfileFormatItemResource> | null;
    language?: Language;
};

