/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PrivacyLevel } from './PrivacyLevel';
import type { SelectOption } from './SelectOption';
export type Field = {
    order?: number;
    name?: string | null;
    label?: string | null;
    unit?: string | null;
    helpText?: string | null;
    helpTextWarning?: string | null;
    helpLink?: string | null;
    value?: any;
    type?: string | null;
    advanced?: boolean;
    selectOptions?: Array<SelectOption> | null;
    selectOptionsProviderAction?: string | null;
    section?: string | null;
    hidden?: string | null;
    privacy?: PrivacyLevel;
    placeholder?: string | null;
    isFloat?: boolean;
};

