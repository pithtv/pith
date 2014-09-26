"use strict";

var async = require("async");
var Global = require("../../lib/global");
var uuid = require("node-uuid").v1;

module.exports = function(db) {
    var movies = db.collection('movies');
    var episodes = db.collection('episodes');
    var shows = db.collection('shows');
    var people = db.collection('people');
    var keywords = db.collection('keywords');
    var genres = db.collection('genres');
    
    function findOrCreate(collection, query, constructor, callback) {
        if(typeof callback != 'function') {
            callback = constructor;
            constructor = function(q) { return q; };
        }
        collection.findOne(query, function(err, result) {
            if(result) {
                callback(null, result);
            } else {
                constructor(query, function(err, result) {
                    collection.insert(result, function(err, result) {
                        callback(err, result && result[0]);
                    });
                });
            }
        });
    }
    
    function getPerson(name, job, callback) {
        people.findOne({name: name}, function(err, result) {
            if(!result) {
                result = {name: name};
                result[job] = true;
                people.insert(result, function(err, result) {
                    callback(err, result && result[0]);
                });
            } else if(!result[job]) {
                var update = {};
                result[job] = true;
                update[job] = true;
                people.update({_id: result._id}, {$set: update}, function(err) {
                    callback(err, result);
                });
            } else {
                callback(null, result);
            }
        });
    }
    
    function getKeyword(name, callback) {
        findOrCreate(keywords, {name: name}, callback);
    }
    
    function getGenre(name, callback) {
        findOrCreate(genres, {name: name}, callback);
    }
    
    function _id(callback) {
        return function(err, result) {
            callback(err, result._id.toHexString());
        };
    }
    
    function getActorId(name, callback) {
        getPerson(name, "actor", _id(callback));
    }
    
    function getDirectorId(name, callback) {
        getPerson(name, "director", _id(callback));
    }
    
    function getWriterId(name, callback) {
        getPerson(name, "writer", _id(callback));
    }
    
    function getKeywordId(name, callback) {
        getKeyword(name, _id(callback));
    }
    
    function getGenreId(name, callback) {
        getGenre(name, _id(callback));
    }
    
    function storeMovie(item, callback) {
        var movie = {};
        for(var x in item) movie[x] = item[x];
        
        movie.id = uuid();
        
        async.mapSeries(movie.actors, getActorId, function(err, result) {
            movie.actorIds = result;
            async.mapSeries(movie.keywords, getKeywordId, function(err, result) {
                movie.keywordIds = result;
                async.mapSeries(movie.genres, getGenreId, function(err, result) {
                    movie.genreIds = result;
                    movies.insert(movie, function() {
                        callback();
                    });
                });
            });
        });
    }
    
    function storeEpisode(item, callback) {
        var episode = {};
        for(var x in item) episode[x] = item[x];
    }
    
    function getKeywords(callback) {
        keywords.find({}).toArray(callback);
    }
    
    function getGenres(callback) {
        genres.find({}).toArray(callback);
    }
    
    function getActors(callback) {
        people.find({actor: true}).toArray(callback);
    }
    
    function getDirectors(callback) {
        people.find({director: true}).toArray(callback);
    }
    
    function getWriters(callback) {
        people.find({writer: true}).toArray(callback);
    }
    
    function getMovies(selector, callback) {
        movies.find(selector).toArray(callback);
    }
    
    function findMovieByOriginalId(channelId, itemId, callback) {
        movies.findOne({channelId: channelId, originalId: itemId}, callback);
    }
    
    function getMovie(itemId, callback) {
        movies.findOne({id: itemId}, callback);
    }
    
    return {
        getPerson: getPerson,
        
        storeMovie: storeMovie,
        
        getKeywords: getKeywords,
        getGenres: getGenres,
        getActors: getActors,
        getDirectors: getDirectors,
        getWriters: getWriters,
        getMovies: getMovies,
        findMovieByOriginalId: findMovieByOriginalId,
        getMovie: getMovie
    };
};