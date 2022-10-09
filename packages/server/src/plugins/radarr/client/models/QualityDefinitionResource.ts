/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Quality } from './Quality';

export type QualityDefinitionResource = {
    id?: number;
    quality?: Quality;
    title?: string | null;
    weight?: number;
    minSize?: number | null;
    maxSize?: number | null;
    preferredSize?: number | null;
};

