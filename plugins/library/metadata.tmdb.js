"use strict";

var tmdb = require("moviedb")("a08cfd3b50689d40b46a078ecc7390bb");
var dateParser = /(\d{4})-(\d{2})-(\d{2})/;

var configuration;
tmdb.configuration(function(err, conf) {
    configuration = conf;
});

function createUrl(path) {
    return path && configuration.images.base_url + "original" + path;
}

function parseDate(d) {
    var p = d.match(dateParser);
    return new Date(parseInt(p[1]),parseInt(p[2])-1,parseInt(p[3]));
}

function get(property) {
    return function(e) {
        return e[property];
    };
}

module.exports = function(item, mediatype, callback) {
    var movie;
    
    function parser(err, result) {
        if(err) {
            console.log(err, item);
            callback(err);
        } else {
            var movies = result.movie_results || result.results;
            var movie = movies[0]; // for now just pick the first one
            
            if(!movie) {
                callback("No movie found");
                return;
            }
            
            tmdb.movieInfo({
                id: movie.id,
                append_to_response: 'credits,keywords'
            }, function(err, result) {
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
                    
                    item.directors = result.credits.crew.filter(function(e) {
                        return e.job == 'Director'; 
                    }).map(get('name'));
                    
                    item.writers = result.credits.crew.filter(function(e) {
                        return e.job == "Screenplay";
                    }).map(get('name'));
                    
                    callback(undefined, item);
                }
            });
        }
    }

    function tvParser(err, result) {
        var metadata = {
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
        }

        for(var x in metadata) item[x] = metadata[x];
        callback(undefined, item);
    }

    function episodeParser(ep, item) {
        if(!ep) {
            return item;
        }

        var metadata = {
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
            for (var x in metadata) {
                item[x] = metadata[x];
            }

            return item;
        } else {
            return metadata;
        }
    }

    function seasonParser(err, result) {
        var metadata = {
            _children: result.episodes.map(episodeParser),

            title: result.name,
            overview: result.overview,
            tmdbId: result.id,
            poster: createUrl(result.poster_path),
            season: result.season_number
        };

        for(var x in metadata) item[x] = metadata[x];
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
                var q = {
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
                tmdb.searchTv({query: item.showname || item.title}, function(err, result) {
                    if(err || !result.results[0]) {
                        callback(err || Error("No result found for show", item));
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
                tmdb.tvEpisodeInfo({id: item.showTmdbId, season_number: item.season, episode_number: item.episode}, function(err, ep) {
                    callback(undefined, episodeParser(ep, item));
                });
            } else {
                callback(Error("Need show tmdb id"));
            }
            break;
    }
};
