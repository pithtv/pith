export interface Show {
    id: string
    title: string
    overview?: string
    poster?: string
    originalTitle?: string

    tmdbRating?: number
    tmdbVoteCount?: number

    seasons: Season[]
    genres?: string[]
    homepage?: string
    status?: string
    noEpisodes?: number
    noSeasons?: number
    tmdbId: string
    backdrop?: string
}

export interface Season {
    title: string
    overview?: string
    tmdbId?: string
    poster?: string
    showId: string
    season: number
    episodes: Episode[]
}

export interface Episode {
    tmdbId?: string

    originalId?: string
    channelId?: string
    scannedDate?: Date

    title: string
    overview?: string
    poster?: string
    still?: string
    tmdbRating?: number
    tmdbVoteCount?: number
    showId: string
    season: number
    episode: number
    airDate: Date
}
