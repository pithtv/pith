/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Modifier } from './Modifier';
import type { Source } from './Source';

export type Quality = {
    id?: number;
    name?: string | null;
    source?: Source;
    resolution?: number;
    modifier?: Modifier;
};

