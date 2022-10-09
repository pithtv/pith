/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Command } from './Command';
import type { CommandPriority } from './CommandPriority';
import type { CommandStatus } from './CommandStatus';
import type { CommandTrigger } from './CommandTrigger';
import type { TimeSpan } from './TimeSpan';

export type CommandResource = {
    id?: number;
    name?: string | null;
    commandName?: string | null;
    message?: string | null;
    body?: Command;
    priority?: CommandPriority;
    status?: CommandStatus;
    queued?: string;
    started?: string | null;
    ended?: string | null;
    duration?: TimeSpan;
    exception?: string | null;
    trigger?: CommandTrigger;
    clientUserAgent?: string | null;
    stateChangeTime?: string | null;
    sendUpdatesToClient?: boolean;
    updateScheduledTask?: boolean;
    lastExecutionTime?: string | null;
};

