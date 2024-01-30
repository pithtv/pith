/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Field } from './Field';
import type { ProviderMessage } from './ProviderMessage';
export type MetadataResource = {
    id?: number;
    name?: string | null;
    fields?: Array<Field> | null;
    implementationName?: string | null;
    implementation?: string | null;
    configContract?: string | null;
    infoLink?: string | null;
    message?: ProviderMessage;
    tags?: Array<number> | null;
    presets?: Array<MetadataResource> | null;
    enable?: boolean;
};

