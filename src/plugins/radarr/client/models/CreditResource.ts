/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CreditType } from './CreditType';
import type { MediaCover } from './MediaCover';

export type CreditResource = {
    id?: number;
    personName?: string | null;
    creditTmdbId?: string | null;
    personTmdbId?: number;
    movieMetadataId?: number;
    images?: Array<MediaCover> | null;
    department?: string | null;
    job?: string | null;
    character?: string | null;
    order?: number;
    type?: CreditType;
};

