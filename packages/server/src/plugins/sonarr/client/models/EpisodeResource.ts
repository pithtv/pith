/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EpisodeFileResource } from './EpisodeFileResource';
import type { MediaCover } from './MediaCover';
import type { SeriesResource } from './SeriesResource';
export type EpisodeResource = {
    id?: number;
    seriesId?: number;
    tvdbId?: number;
    episodeFileId?: number;
    seasonNumber?: number;
    episodeNumber?: number;
    title?: string | null;
    airDate?: string | null;
    airDateUtc?: string | null;
    runtime?: number;
    finaleType?: string | null;
    overview?: string | null;
    episodeFile?: EpisodeFileResource;
    hasFile?: boolean;
    monitored?: boolean;
    absoluteEpisodeNumber?: number | null;
    sceneAbsoluteEpisodeNumber?: number | null;
    sceneEpisodeNumber?: number | null;
    sceneSeasonNumber?: number | null;
    unverifiedSceneNumbering?: boolean;
    endTime?: string | null;
    grabDate?: string | null;
    seriesTitle?: string | null;
    series?: SeriesResource;
    images?: Array<MediaCover> | null;
    grabbed?: boolean;
};

