/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TimeSpan } from './TimeSpan';

export type TaskResource = {
    id?: number;
    name?: string | null;
    taskName?: string | null;
    interval?: number;
    lastExecution?: string;
    lastStartTime?: string;
    nextExecution?: string;
    lastDuration?: TimeSpan;
};

