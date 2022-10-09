/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { CustomFormatResource } from './CustomFormatResource';
import type { DownloadProtocol } from './DownloadProtocol';
import type { Language } from './Language';
import type { QualityModel } from './QualityModel';

export type ReleaseResource = {
    id?: number;
    guid?: string | null;
    quality?: QualityModel;
    customFormats?: Array<CustomFormatResource> | null;
    customFormatScore?: number;
    qualityWeight?: number;
    age?: number;
    ageHours?: number;
    ageMinutes?: number;
    size?: number;
    indexerId?: number;
    indexer?: string | null;
    releaseGroup?: string | null;
    subGroup?: string | null;
    releaseHash?: string | null;
    title?: string | null;
    sceneSource?: boolean;
    movieTitles?: Array<string> | null;
    languages?: Array<Language> | null;
    approved?: boolean;
    temporarilyRejected?: boolean;
    rejected?: boolean;
    tmdbId?: number;
    imdbId?: number;
    rejections?: Array<string> | null;
    publishDate?: string;
    commentUrl?: string | null;
    downloadUrl?: string | null;
    infoUrl?: string | null;
    downloadAllowed?: boolean;
    releaseWeight?: number;
    indexerFlags?: Array<string> | null;
    edition?: string | null;
    magnetUrl?: string | null;
    infoHash?: string | null;
    seeders?: number | null;
    leechers?: number | null;
    protocol?: DownloadProtocol;
    movieId?: number | null;
};

