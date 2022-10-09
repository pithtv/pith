/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type IndexerConfigResource = {
    id?: number;
    minimumAge?: number;
    maximumSize?: number;
    retention?: number;
    rssSyncInterval?: number;
    preferIndexerFlags?: boolean;
    availabilityDelay?: number;
    allowHardcodedSubs?: boolean;
    whitelistedHardcodedSubs?: string | null;
};

