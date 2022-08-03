/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomFormatResource } from './CustomFormatResource';
import type { DownloadProtocol } from './DownloadProtocol';
import type { Language } from './Language';
import type { MovieResource } from './MovieResource';
import type { QualityModel } from './QualityModel';
import type { TimeSpan } from './TimeSpan';
import type { TrackedDownloadState } from './TrackedDownloadState';
import type { TrackedDownloadStatus } from './TrackedDownloadStatus';
import type { TrackedDownloadStatusMessage } from './TrackedDownloadStatusMessage';

export type QueueResource = {
    id?: number;
    movieId?: number | null;
    movie?: MovieResource;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    size?: number;
    title?: string | null;
    sizeleft?: number;
    timeleft?: TimeSpan;
    estimatedCompletionTime?: string | null;
    status?: string | null;
    trackedDownloadStatus?: TrackedDownloadStatus;
    trackedDownloadState?: TrackedDownloadState;
    statusMessages?: Array<TrackedDownloadStatusMessage> | null;
    errorMessage?: string | null;
    downloadId?: string | null;
    protocol?: DownloadProtocol;
    downloadClient?: string | null;
    indexer?: string | null;
    outputPath?: string | null;
};

