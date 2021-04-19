import {MovieDb} from 'moviedb-promise';
import {getLogger} from 'log4js';
import {Episode, Season, Show} from "../../persistence/Schema";
import {
    Backdrop,
    ExternalId,
    MovieImagesResponse,
    MovieKeywordResponse,
    MovieResponse,
    PersonMovieCreditsResponse,
    Poster
} from "moviedb-promise/dist/request-types";
import {Image} from "../../channel";

const tmdb = new MovieDb('a08cfd3b50689d40b46a078ecc7390bb');
const dateParser = /(\d{4})-(\d{2})-(\d{2})/;
const logger = getLogger('pith.plugin.library.metadata.tmdb');

let configuration;
tmdb.configuration().then(conf => configuration = conf);

function createUrl(path) {
    return path && configuration.images.base_url + 'original' + path;
}

function parseDate(d) {
    if (d == null) {
        return null;
    }
    const p = d.match(dateParser);
    if (!p) {
        return null;
    }
    return new Date(parseInt(p[1]), parseInt(p[2]) - 1, parseInt(p[3]));
}

function extractImages(backdrops: (Backdrop | Poster)[]): Image[] {
    return backdrops.map(i => ({
        url: createUrl(i.file_path),
        width: i.width,
        height: i.height,
        language: i.iso_639_1
    }))
}

async function parseMovie(movie) {
    const result = await tmdb.movieInfo({
        id: movie.id,
        append_to_response: 'credits,keywords,images'
    }) as MovieResponse & {
        credits: PersonMovieCreditsResponse,
        keywords: MovieKeywordResponse,
        images: MovieImagesResponse
    };

    const releaseDate = parseDate(result.release_date);
    return {
        genres: result.genres.map(e => e['name']),
        title: result.title,
        imdbId: result.imdb_id,
        poster: createUrl(result.poster_path),
        backdrop: createUrl(result.backdrop_path),
        releaseDate: releaseDate,
        runtime: result.runtime,
        tagline: result.tagline,
        plot: result.overview,
        tmdbRating: result.vote_average,
        tmdbVoteCount: result.vote_count,
        keywords: result.keywords.keywords.map(e => e['name']),
        actors: result.credits.cast.map(e => e['name']),
        directors: result.credits.crew.filter(e => e.job === 'Director').map(e => e['name']),
        writers: result.credits.crew.filter(e => e.job === 'Screenplay').map(e => e['name']),
        backdrops: extractImages(result.images.backdrops),
        posters: extractImages(result.images.posters),
        year: releaseDate.getFullYear()
    };
}

function parseShow(result): Omit<Show, 'id'> {
    return {
        backdrop: createUrl(result.backdrop_path),
        genres: result.genres.map(e => e.name),
        homepage: result.homepage,
        tmdbId: result.id,
        status: result.status,
        title: result.name,
        noEpisodes: result.number_of_episodes,
        noSeasons: result.number_of_seasons,
        overview: result.overview,
        poster: createUrl(result.poster_path),
        tmdbRating: result.vote_average,
        tmdbVoteCount: result.vote_count,
        seasons: []
    };
}

function parseEpisode(ep) : Omit<Episode, 'showId'> {
    return {
        // mediatype: 'episode',
        tmdbId: ep.id,
        season: ep.season_number,
        episode: ep.episode_number,
        title: ep.name,
        overview: ep.overview,
        still: createUrl(ep.still_path),
        airDate: parseDate(ep.air_date),
        tmdbRating: ep.vote_average,
        tmdbVoteCount: ep.vote_count
    };
}

function parseSeason(result): Omit<Season, 'showId'> {
    return {
        episodes: result.episodes.map(parseEpisode),
        title: result.name,
        overview: result.overview,
        tmdbId: result.id,
        poster: createUrl(result.poster_path),
        season: result.season_number
    };
}

async function queryMovieByImdbId(imdbId) {
    return await tmdb.find({
        id: imdbId,
        external_source: ExternalId.ImdbId
    });
}

async function queryMovieByTitleAndYear(title, year) {
    return await tmdb.searchMovie({
        query: title,
        year: year
    });
}

export async function queryMovie(item) {
    let searchResult;
    if (item.imdbId) {
        searchResult = (await queryMovieByImdbId(item.imdbId)).movie_results[0];
    }

    if(!searchResult) {
        searchResult = (await queryMovieByTitleAndYear(item.title, item.year)).results[0];
    }

    if (!searchResult) {
        throw new Error(`Movie not found for imdbid ${item.imdbId}, title: ${item.title}, year: ${item.year}`);
    }

    return await parseMovie(searchResult);
}

export async function queryShow(item) : Promise<Omit<Show, 'id'>> {
    if (item.tmdbId) {
        const show = await tmdb.tvInfo({id: item.tmdbId});
        return parseShow(show);
    } else if (item.tvdbId) {
        const show = await tmdb.find({
            id: item.tvdbId,
            external_source: ExternalId.TvdbId
        });
        return parseShow(show);
    } else {
        const query = {query: item.showname || item.title};
        const result = await tmdb.searchTv(query);
        if (!result.results[0]) {
            throw new Error(`No result found for show ${item} using query ${query.query}`);
        } else {
            const tv = await tmdb.tvInfo({id: result.results[0].id});
            return parseShow(tv);
        }
    }
}

export async function querySeason(item : {showTmdbId: string, season: number}) : Promise<Omit<Season, 'showId'>> {
    if (item.showTmdbId) {
        const season = await tmdb.seasonInfo({id: item.showTmdbId, season_number: item.season});
        return parseSeason(season);
    } else {
        throw new Error('Need show tmdb id');
    }
}

export async function queryEpisode(item : {showTmdbId: string, season: number, episode: number}) : Promise<Omit<Episode, 'showId'>> {
    if (item.showTmdbId) {
        const episode = await tmdb.episodeInfo({
            id: item.showTmdbId,
            season_number: item.season,
            episode_number: item.episode
        });
        return parseEpisode(episode);
    } else {
        throw new Error('Need show tmdb id');
    }
}
