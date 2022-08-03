/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MovieResource } from './MovieResource';
import type { ParsedMovieInfo } from './ParsedMovieInfo';

export type ParseResource = {
    id?: number;
    title?: string | null;
    parsedMovieInfo?: ParsedMovieInfo;
    movie?: MovieResource;
};

