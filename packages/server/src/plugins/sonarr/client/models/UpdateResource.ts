/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateChanges } from './UpdateChanges';
import type { Version } from './Version';
export type UpdateResource = {
    id?: number;
    version?: Version;
    branch?: string | null;
    releaseDate?: string;
    fileName?: string | null;
    url?: string | null;
    installed?: boolean;
    installedOn?: string | null;
    installable?: boolean;
    latest?: boolean;
    changes?: UpdateChanges;
    hash?: string | null;
};

