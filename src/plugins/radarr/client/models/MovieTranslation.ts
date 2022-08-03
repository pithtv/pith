/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Language } from './Language';

export type MovieTranslation = {
    id?: number;
    movieMetadataId?: number;
    title?: string | null;
    cleanTitle?: string | null;
    overview?: string | null;
    language?: Language;
};

