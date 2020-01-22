"use strict";

const tmdb = require("moviedb")("a08cfd3b50689d40b46a078ecc7390bb");
const dateParser = /(\d{4})-(\d{2})-(\d{2})/;
const logger = require('log4js').getLogger('pith.plugin.library.metadata.tmdb');

let configuration;
tmdb.configuration((err, conf) => {
    configuration = conf;
});

function createUrl(path) {
    return path && configuration.images.base_url + "original" + path;
}

function parseDate(d) {
    if(d==null) {
        return null;
    }
    const p = d.match(dateParser);
    if(!p) {
        return null;
    }
    return new Date(parseInt(p[1]),parseInt(p[2])-1,parseInt(p[3]));
}

function get(property) {
    return e => e[property];
}

module.exports = (item, mediatype, callback) => {
    let movie;

    function parser(err, result) {
        if(err) {
            logger.error(err, item);
            callback(err);
        } else {
            const movies = result.movie_results || result.results;
            const movie = movies[0]; // for now just pick the first one

            if(!movie) {
                callback("No movie found");
                return;
            }

            tmdb.movieInfo({
                id: movie.id,
                append_to_response: 'credits,keywords'
            }, (err, result) => {
                if(err) {
                    callback(err, item);
                } else {
                    item.genres = result.genres.map(get('name'));
                    item.title = result.title;
                    item.imdbId = result.imdb_id;
                    item.poster = createUrl(result.poster_path);
                    item.backdrop = createUrl(result.backdrop_path);
                    item.releaseDate = parseDate(result.release_date);
                    item.runtime = result.runtime;
                    item.tagline = result.tagline;
                    item.plot = result.overview;
                    item.tmdbRating = result.vote_average;
                    item.tmdbVoteCount = result.vote_count;
                    item.keywords = result.keywords.keywords.map(get('name'));
                    item.actors = result.credits.cast.map(get('name'));

                    item.directors = result.credits.crew.filter(e => e.job === 'Director').map(get('name'));

                    item.writers = result.credits.crew.filter(e => e.job === "Screenplay").map(get('name'));

                    callback(undefined, item);
                }
            });
        }
    }

    function tvParser(err, result) {
        const metadata = {
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
            tmdbVoteCount: result.vote_count
        };

        for(let x in metadata) item[x] = metadata[x];
        callback(undefined, item);
    }

    function episodeParser(ep, item) {
        if(!ep) {
            return item;
        }

        const metadata = {
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

        if(item) {
            for(let x of Object.keys(item)) {
                metadata[x] = metadata[x] || item[x];
            }
            return metadata;
        } else {
            return metadata;
        }
    }

    function seasonParser(err, result) {
        if(err) {
            callback(err);
                return;
        }
        const metadata = {
            _children: result.episodes.map(episodeParser),

            title: result.name,
            overview: result.overview,
            tmdbId: result.id,
            poster: createUrl(result.poster_path),
            season: result.season_number
        };

        for(let x in metadata) item[x] = metadata[x];
        callback(undefined, item);
    }

    switch (mediatype) {
        case "movie":
            if (item.imdbId) {
                movie = tmdb.find({
                    id: item.imdbId,
                    external_source: 'imdb_id'
                }, parser);
            } else {
                const q = {
                    query: item.title
                };
                if (item.year) {
                    q.year = item.year;
                }
                tmdb.searchMovie(q, parser);
            }
            break;
        case "show":
            if (item.tmdbId) {
                tmdb.tvInfo({id:item.tmdbId}, tvParser)
            } else if(item.tvdbId) {
                tmdb.find({
                    id: item.tvdbId,
                    external_source: 'tvdb_id'
                }, tvParser);
            } else {
                const query = {query: item.showname || item.title};
                tmdb.searchTv(query, (err, result) => {
                    if(err || !result.results[0]) {
                        callback(err || Error(`No result found for show ${item} using query ${query.query}`));
                    } else {
                        tmdb.tvInfo({id: result.results[0].id}, tvParser);
                    }
                });
            }
            break;
        case "season":
            if (item.showTmdbId) {
                tmdb.tvSeasonInfo({id: item.showTmdbId, season_number: item.season}, seasonParser);
            } else {
                callback(Error("Need show tmdb id"));
            }
            break;
        case "episode":
            if (item.showTmdbId) {
                tmdb.tvEpisodeInfo({id: item.showTmdbId, season_number: item.season, episode_number: item.episode}, (err, ep) => {
                    callback(undefined, episodeParser(ep, item));
                });
            } else {
                callback(Error("Need show tmdb id"));
            }
            break;
    }
};
