/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { BackupType } from './BackupType';

export type BackupResource = {
    id?: number;
    name?: string | null;
    path?: string | null;
    type?: BackupType;
    size?: number;
    time?: string;
};

