/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Field } from './Field';
export type CustomFormatSpecificationSchema = {
    id?: number;
    name?: string | null;
    implementation?: string | null;
    implementationName?: string | null;
    infoLink?: string | null;
    negate?: boolean;
    required?: boolean;
    fields?: Array<Field> | null;
    presets?: Array<CustomFormatSpecificationSchema> | null;
};

