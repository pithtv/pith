/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Field } from './Field';
import type { ImportListType } from './ImportListType';
import type { MonitorTypes } from './MonitorTypes';
import type { MovieStatusType } from './MovieStatusType';
import type { ProviderMessage } from './ProviderMessage';

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
    enabled?: boolean;
    enableAuto?: boolean;
    monitor?: MonitorTypes;
    rootFolderPath?: string | null;
    qualityProfileId?: number;
    searchOnAdd?: boolean;
    minimumAvailability?: MovieStatusType;
    listType?: ImportListType;
    listOrder?: number;
};

