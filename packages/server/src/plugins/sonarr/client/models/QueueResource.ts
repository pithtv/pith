/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomFormatResource } from './CustomFormatResource';
import type { DownloadProtocol } from './DownloadProtocol';
import type { EpisodeResource } from './EpisodeResource';
import type { Language } from './Language';
import type { QualityModel } from './QualityModel';
import type { SeriesResource } from './SeriesResource';
import type { TimeSpan } from './TimeSpan';
import type { TrackedDownloadState } from './TrackedDownloadState';
import type { TrackedDownloadStatus } from './TrackedDownloadStatus';
import type { TrackedDownloadStatusMessage } from './TrackedDownloadStatusMessage';
export type QueueResource = {
    id?: number;
    seriesId?: number | null;
    episodeId?: number | null;
    seasonNumber?: number | null;
    series?: SeriesResource;
    episode?: EpisodeResource;
    languages?: Array<Language> | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    customFormatScore?: number;
    size?: number;
    title?: string | null;
    sizeleft?: number;
    timeleft?: TimeSpan;
    estimatedCompletionTime?: string | null;
    added?: string | null;
    status?: string | null;
    trackedDownloadStatus?: TrackedDownloadStatus;
    trackedDownloadState?: TrackedDownloadState;
    statusMessages?: Array<TrackedDownloadStatusMessage> | null;
    errorMessage?: string | null;
    downloadId?: string | null;
    protocol?: DownloadProtocol;
    downloadClient?: string | null;
    downloadClientHasPostImportCategory?: boolean;
    indexer?: string | null;
    outputPath?: string | null;
    episodeHasFile?: boolean;
};

