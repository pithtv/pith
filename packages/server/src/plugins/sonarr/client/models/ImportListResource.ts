/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Field } from './Field';
import type { ImportListType } from './ImportListType';
import type { MonitorTypes } from './MonitorTypes';
import type { NewItemMonitorTypes } from './NewItemMonitorTypes';
import type { ProviderMessage } from './ProviderMessage';
import type { SeriesTypes } from './SeriesTypes';
import type { TimeSpan } from './TimeSpan';
export type ImportListResource = {
    id?: number;
    name?: string | null;
    fields?: Array<Field> | null;
    implementationName?: string | null;
    implementation?: string | null;
    configContract?: string | null;
    infoLink?: string | null;
    message?: ProviderMessage;
    tags?: Array<number> | null;
    presets?: Array<ImportListResource> | null;
    enableAutomaticAdd?: boolean;
    searchForMissingEpisodes?: boolean;
    shouldMonitor?: MonitorTypes;
    monitorNewItems?: NewItemMonitorTypes;
    rootFolderPath?: string | null;
    qualityProfileId?: number;
    seriesType?: SeriesTypes;
    seasonFolder?: boolean;
    listType?: ImportListType;
    listOrder?: number;
    minRefreshInterval?: TimeSpan;
};

