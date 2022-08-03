/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtraFileType } from './ExtraFileType';

export type ExtraFileResource = {
    id?: number;
    movieId?: number;
    movieFileId?: number | null;
    relativePath?: string | null;
    extension?: string | null;
    type?: ExtraFileType;
};

