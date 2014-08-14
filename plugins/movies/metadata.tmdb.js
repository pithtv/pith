var tmdb = require("moviedb")("a08cfd3b50689d40b46a078ecc7390bb");

var configuration;
tmdb.configuration(function(err, conf) {
    configuration = conf;
});

function createUrl(path) {
    return configuration.images.base_url + "original" + path;
}

function get(property) {
    return function(e) {
        return e[property];
    }
}

module.exports = function(item, callback) {
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
                    item.releaseDate = result.release_date;
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
    
    if(item.imdbId) {
        movie = tmdb.find({
            id: item.imdbId,
            external_source: 'imdb_id'
        }, parser);
    } else {
        movie = tmdb.searchMovie({
            query: item.title,
            year: item.year
        }, parser);
    }
};
