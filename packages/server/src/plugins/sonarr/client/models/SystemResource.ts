/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthenticationType } from './AuthenticationType';
import type { DatabaseType } from './DatabaseType';
import type { RuntimeMode } from './RuntimeMode';
import type { UpdateMechanism } from './UpdateMechanism';
import type { Version } from './Version';
export type SystemResource = {
    appName?: string | null;
    instanceName?: string | null;
    version?: string | null;
    buildTime?: string;
    isDebug?: boolean;
    isProduction?: boolean;
    isAdmin?: boolean;
    isUserInteractive?: boolean;
    startupPath?: string | null;
    appData?: string | null;
    osName?: string | null;
    osVersion?: string | null;
    isNetCore?: boolean;
    isLinux?: boolean;
    isOsx?: boolean;
    isWindows?: boolean;
    isDocker?: boolean;
    mode?: RuntimeMode;
    branch?: string | null;
    authentication?: AuthenticationType;
    sqliteVersion?: Version;
    migrationVersion?: number;
    urlBase?: string | null;
    runtimeVersion?: Version;
    runtimeName?: string | null;
    startTime?: string;
    packageVersion?: string | null;
    packageAuthor?: string | null;
    packageUpdateMechanism?: UpdateMechanism;
    packageUpdateMechanismMessage?: string | null;
    databaseVersion?: Version;
    databaseType?: DatabaseType;
};

