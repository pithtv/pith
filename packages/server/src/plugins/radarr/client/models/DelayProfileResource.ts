/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DownloadProtocol } from './DownloadProtocol';

export type DelayProfileResource = {
    id?: number;
    enableUsenet?: boolean;
    enableTorrent?: boolean;
    preferredProtocol?: DownloadProtocol;
    usenetDelay?: number;
    torrentDelay?: number;
    bypassIfHighestQuality?: boolean;
    order?: number;
    tags?: Array<number> | null;
};

