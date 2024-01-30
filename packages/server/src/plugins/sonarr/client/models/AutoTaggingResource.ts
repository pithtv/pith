/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AutoTaggingSpecificationSchema } from './AutoTaggingSpecificationSchema';
export type AutoTaggingResource = {
    id?: number;
    name?: string | null;
    removeTagsAutomatically?: boolean;
    tags?: Array<number> | null;
    specifications?: Array<AutoTaggingSpecificationSchema> | null;
};

