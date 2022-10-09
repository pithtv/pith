/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Language } from './Language';
import type { SourceType } from './SourceType';

export type AlternativeTitleResource = {
    id?: number;
    sourceType?: SourceType;
    movieMetadataId?: number;
    title?: string | null;
    cleanTitle?: string | null;
    sourceId?: number;
    votes?: number;
    voteCount?: number;
    language?: Language;
};

