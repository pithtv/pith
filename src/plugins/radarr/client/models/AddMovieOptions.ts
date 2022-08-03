/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AddMovieMethod } from './AddMovieMethod';
import type { MonitorTypes } from './MonitorTypes';

export type AddMovieOptions = {
    ignoreEpisodesWithFiles?: boolean;
    ignoreEpisodesWithoutFiles?: boolean;
    monitor?: MonitorTypes;
    searchForMovie?: boolean;
    addMethod?: AddMovieMethod;
};

