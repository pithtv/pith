/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomFormatSpecificationSchema } from './CustomFormatSpecificationSchema';

export type CustomFormatResource = {
    id?: number;
    name?: string | null;
    includeCustomFormatWhenRenaming?: boolean;
    specifications?: Array<CustomFormatSpecificationSchema> | null;
};

