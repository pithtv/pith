import moviedb from 'moviedb';
import {getLogger} from 'log4js';
import {wrap} from '../../lib/async';
import {Episode, Season, Show} from "../../persistence/Schema";

const tmdb = moviedb('a08cfd3b50689d40b46a078ecc7390bb');
const dateParser = /(\d{4})-(\d{2})-(\d{2})/;
const logger = getLogger('pith.plugin.library.metadata.tmdb');

let configuration;
tmdb.configuration((err, conf) => {
    configuration = conf;
});

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

async function parseMovie(movie) {
    const result = await wrap<any>(cb => tmdb.movieInfo({
        id: movie.id,
        append_to_response: 'credits,keywords'
    }, cb));

    return {
        genres: result.genres.map(e => e['name']),
        title: result.title,
        imdbId: result.imdb_id,
        poster: createUrl(result.poster_path),
        backdrop: createUrl(result.backdrop_path),
        releaseDate: parseDate(result.release_date),
        runtime: result.runtime,
        tagline: result.tagline,
        plot: result.overview,
        tmdbRating: result.vote_average,
        tmdbVoteCount: result.vote_count,
        keywords: result.keywords.keywords.map(e => e['name']),
        actors: result.credits.cast.map(e => e['name']),

        directors: result.credits.crew.filter(e => e.job === 'Director').map(e => e['name']),

        writers: result.credits.crew.filter(e => e.job === 'Screenplay').map(e => e['name'])
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
    return await wrap<{movie_results: any[]}>(cb => tmdb.find({
        id: imdbId,
        external_source: 'imdb_id'
    }, cb));
}

async function queryMovieByTitleAndYear(title, year) {
    return await wrap<{results: any[]}>(cb => tmdb.searchMovie({
        query: title,
        year: year
    }, cb));
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
        const show = await wrap(cb => tmdb.tvInfo({id: item.tmdbId}, cb));
        return parseShow(show);
    } else if (item.tvdbId) {
        const show = await wrap(cb => tmdb.find({
            id: item.tvdbId,
            external_source: 'tvdb_id'
        }, cb));
        return parseShow(show);
    } else {
        const query = {query: item.showname || item.title};
        const result = await wrap<any>(cb => tmdb.searchTv(query, cb));
        if (!result.results[0]) {
            throw new Error(`No result found for show ${item} using query ${query.query}`);
        } else {
            const tv = await wrap(cb => tmdb.tvInfo({id: result.results[0].id}, cb));
            return parseShow(tv);
        }
    }
}

export async function querySeason(item : {showTmdbId: string, season: number}) : Promise<Omit<Season, 'showId'>> {
    if (item.showTmdbId) {
        const season = await wrap(cb => tmdb.tvSeasonInfo({id: item.showTmdbId, season_number: item.season}, cb));
        return parseSeason(season);
    } else {
        throw new Error('Need show tmdb id');
    }
}

export async function queryEpisode(item : {showTmdbId: string, season: number, episode: number}) : Promise<Omit<Episode, 'showId'>> {
    if (item.showTmdbId) {
        const episode = await wrap(cb => tmdb.tvEpisodeInfo({
            id: item.showTmdbId,
            season_number: item.season,
            episode_number: item.episode
        }, cb));
        return parseEpisode(episode);
    } else {
        throw new Error('Need show tmdb id');
    }
}
