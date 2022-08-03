/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ColonReplacementFormat } from './ColonReplacementFormat';

export type NamingConfigResource = {
    id?: number;
    renameMovies?: boolean;
    replaceIllegalCharacters?: boolean;
    colonReplacementFormat?: ColonReplacementFormat;
    standardMovieFormat?: string | null;
    movieFolderFormat?: string | null;
    includeQuality?: boolean;
    replaceSpaces?: boolean;
    separator?: string | null;
    numberStyle?: string | null;
};

