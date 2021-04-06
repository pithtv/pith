export interface SonarrSeries {
    title: string,
    alternateTitles: { title: string, seasonNumber: number }[],
    sortTitle: string,
    seasonCount: number,
    totalEpisodeCount: number,
    episodeCount: number,
    episodeFileCount: number,
    sizeOnDisk: number,
    status: string,
    overview: string,
    previousAiring: string,
    network: string,
    airTime: string,
    images: { coverType: string, url: string }[],
    seasons: SonarrSeason[],
    year: number,
    path: string,
    profileId: number,
    seasonFolder: boolean,
    monitored: boolean,
    useSceneNumber: boolean,
    runtime: number,
    tvdbId: number,
    tvRageId: number,
    tvMazeId: number,
    firstAired: string,
    lastInfoSync: string,
    seriesType: string,
    cleanTitle: string,
    imdbId: string,
    titleSlug: string,
    certification: string,
    genres: string[],
    tags: string[],
    added: string,
    ratings: {
        votes: number,
        value: number
    },
    qualityProfileId: number,
    id: number
}

export interface SonarrEpisodeFile {
    path: string
    relativePath: string
    dateAdded: string
}

export interface SonarrEpisode {
    episodeFile: SonarrEpisodeFile;
    seriesId: number,
    episodeFileId: number,
    seasonNumber: number,
    episodeNumber: number,
    title: string,
    airDate: string,
    airDateUtc: string,
    overview: string,
    hasFile: boolean,
    monitored: boolean,
    sceneEpisodeNumber: number,
    sceneSeasonNumber: number,
    tvDbEpisodeId: number,
    absoluteEpisodeNumber: number,
    id: number
}

export interface SonarrSeason {
    seasonNumber: number,
    monitored: boolean,
    statistics: {
        previousAiring: string,
        episodeFileCount: number,
        episodeCount: number,
        totalEpisodeCount: number,
        sizeOnDisk: number,
        percentOfEpisodes: number
    }
}
