/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Quality } from './Quality';
import type { Revision } from './Revision';

export type QualityModel = {
    quality?: Quality;
    revision?: Revision;
    hardcodedSubs?: string | null;
};

