import moviedb from 'moviedb';
import {getLogger} from 'log4js';
import {wrap} from '../../lib/async';

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

function get(property) {
    return e => e[property];
}

async function parseMovie(movie) {
    const result = await wrap<any>(cb => tmdb.movieInfo({
        id: movie.id,
        append_to_response: 'credits,keywords'
    }, cb));

    return {
        genres: result.genres.map(get('name')),
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
        keywords: result.keywords.keywords.map(get('name')),
        actors: result.credits.cast.map(get('name')),

        directors: result.credits.crew.filter(e => e.job === 'Director').map(get('name')),

        writers: result.credits.crew.filter(e => e.job === 'Screenplay').map(get('name'))
    };
}

async function parseShow(result) {
    return {
        backdrop: createUrl(result.backdrop_path),
        genres: result.genres.map(get('name')),
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
    };
}

async function parseEpisode(ep) {
    return {
        mediatype: 'episode',
        tmdbId: ep.id,
        episode: ep.episode_number,
        season: ep.season_number,
        title: ep.name,
        overview: ep.overview,
        still: createUrl(ep.still_path),
        airDate: parseDate(ep.air_date),
        tmdbRating: ep.vote_average,
        tmdbVoteCount: ep.vote_count
    };
}

async function parseSeason(result) {
    return {
        _children: result.episodes.map(parseEpisode),

        title: result.name,
        overview: result.overview,
        tmdbId: result.id,
        poster: createUrl(result.poster_path),
        season: result.season_number
    };
}

export async function queryMovie(item) {
    let searchResult;
    if (item.imdbId) {
        searchResult = await wrap(cb => tmdb.find({
            id: item.imdbId,
            external_source: 'imdb_id'
        }, cb));
    } else {
        const q = {
            query: item.title,
            year: item.year
        };
        searchResult = await wrap(cb => tmdb.searchMovie(q, cb));
    }

    const movies = searchResult.movie_results || searchResult.results;
    const movie = movies[0]; // for now just pick the first one

    if (!movie) {
        throw new Error(`Movie not found for imdbid ${item.imdbId}, title: ${item.title}, year: ${item.year}`);
    }

    return await parseMovie(searchResult);
}

export async function queryShow(item) {
    if (item.tmdbId) {
        const show = await wrap(cb => tmdb.tvInfo({id: item.tmdbId}, cb));
        return await parseShow(show);
    } else if (item.tvdbId) {
        const show = await wrap(cb => tmdb.find({
            id: item.tvdbId,
            external_source: 'tvdb_id'
        }, cb));
        return await parseShow(show);
    } else {
        const query = {query: item.showname || item.title};
        const result = await wrap<any>(cb => tmdb.searchTv(query, cb));
        if (!result.results[0]) {
            throw new Error(`No result found for show ${item} using query ${query.query}`);
        } else {
            const tv = await wrap(cb => tmdb.tvInfo({id: result.results[0].id}, cb));
            return await parseShow(tv);
        }
    }
}

export async function querySeason(item) {
    if (item.showTmdbId) {
        const season = await wrap(cb => tmdb.tvSeasonInfo({id: item.showTmdbId, season_number: item.season}));
        return await parseSeason(season);
    } else {
        throw new Error('Need show tmdb id');
    }
}

export async function queryEpisode(item) {
    if (item.showTmdbId) {
        const episode = await wrap(cb => tmdb.tvEpisodeInfo({
            id: item.showTmdbId,
            season_number: item.season,
            episode_number: item.episode
        }, cb));
        return await parseEpisode(episode);
    } else {
        throw new Error('Need show tmdb id');
    }
}
