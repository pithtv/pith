/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SelectOption } from './SelectOption';

export type Field = {
    order?: number;
    name?: string | null;
    label?: string | null;
    unit?: string | null;
    helpText?: string | null;
    helpLink?: string | null;
    value?: any;
    type?: string | null;
    advanced?: boolean;
    selectOptions?: Array<SelectOption> | null;
    selectOptionsProviderAction?: string | null;
    section?: string | null;
    hidden?: string | null;
    placeholder?: string | null;
};

