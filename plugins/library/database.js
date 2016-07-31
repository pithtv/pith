"use strict";

var async = require("async");
var Global = require("../../lib/global")();
var uuid = require("node-uuid").v1;

module.exports = function(db) {
    var movies = db.collection('movies');
    var people = db.collection('people');
    var keywords = db.collection('keywords');
    var genres = db.collection('genres');
    var series = db.collection('series');

    function insertOrUpdate(collection, entity, callback) {
        entity.modificationTime = new Date();
        if(entity._id) {
            collection.update({_id: entity._id}, {$set: entity}, callback);
        } else {
            if(!entity.id) {
                entity.id = uuid();
            }
            if(!entity.creationTime) {
                entity.creationTime = new Date();
            }
            collection.insert(entity, callback);
        }
    }

    function findOrCreate(collection, query, constructor, callback) {
        if(typeof callback != 'function') {
            callback = constructor;
            constructor = function(q, cb) { cb(undefined, q); };
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

    function singleResult(callback) {
        return function(err, result) {
            if(!result || result.length == 0) {
                callback(false, null);
            } else if(result.length > 1) {
                callback("Expecting single result");
            } else {
                callback(false, result[0]);
            }
        }
    }
    
    function getKeyword(name, callback) {
        findOrCreate(keywords, {name: name}, callback);
    }
    
    function getGenre(name, callback) {
        findOrCreate(genres, {name: name}, callback);
    }
    
    function _id(callback) {
        return function(err, result) {
            callback(err, result && result._id.toHexString());
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
                    insertOrUpdate(movies, movie, callback);
                });
            });
        });
    }

    function storeShow(item, callback) {
        insertOrUpdate(series, item, callback);
    }

    function findSeason(item, callback) {
        series.find({seasons: {$elemMatch: item}}, {'seasons.$': 1}).toArray(function(err, result) {
            if(err) callback(err);
            else callback(err, result[0] && result[0].seasons[0]);
        });
    }

    function findSeasons(item, sorting) {
        return series.find({id: item.showId}, {seasons: 1}).sort(sorting).toArray().catch(function(err) {
            console.log(err);
        }).then(function(e) {
            return e[0].seasons;
        });
    }

    function storeSeason(item, callback) {
        series.updateOne({id: item.showId, seasons: {$elemMatch: item}}, {$set: {'seasons.$': item}}, function(err, results) {
            if(err) callback(err);
            else if(results.nMatched) callback(err, results);
            else series.updateOne({id: item.showId}, {$push: {seasons: item}}, callback);
        });
    }

    function findEpisode(item, callback) {
        series.find(
            {episodes: { $elemMatch: item}},
            {episodes: { $elemMatch: item}}
        ).toArray(function(err, show) {
            if(err) callback(err);
            else {
                callback(false, show[0] && show[0].episodes && show[0].episodes[0]);
            }
        });
    }

    function findEpisodes(item, callback) {
        return series.find(
            {
                episodes: {
                    $elemMatch: item
                }
            },
            {
                episodes: {
                    $elemMatch: item
                }
            }
        ).toArray().then(function(result) {
            return result.reduce(function(a,b) {
                return a.concat(b.episodes);
            }, []);
        });
    }

    function storeEpisode(item, callback) {
        series.updateOne({
            id: item.showId,
            episodes: {$elemMatch: {season: item.season, episode: item.episode}}
        }, {$set: {'episodes.$': item}}, function (err, result) {
            if (err || result.matchedCount) callback(err, result)
            else series.updateOne({
                id: item.showId
            }, {$push: {'episodes': item}}, callback);
        })
    }

    function findShow(query, callback) {
        series.find(query).toArray(singleResult(callback));
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

    function findShows(selector, sorting) {
        return series.find(selector, {seasons: 0, episodes: 0}).sort(sorting).toArray();
    }
    
    function findMovieByOriginalId(channelId, itemId, callback) {
        movies.find({channelId: channelId, originalId: itemId}).toArray(singleResult(callback));
    }
    
    function getMovie(itemId, callback) {
        movies.find({id: itemId}, singleResult(callback));
    }

    function findAll(query, opts, callback) {
        if(typeof opts === 'function') {
            callback = opts;
            opts = undefined;
        }
        var cursor = this.find(query);
        if(opts && opts.order) {
            cursor.sort(opts.order);
        }
        if(opts && opts.limit) {
            cursor.limit(opts.limit);
        }
        return cursor.toArray(callback);
    }

    return {
        getPerson: getPerson,
        
        storeMovie: storeMovie,
        
        getKeywords: getKeywords,
        getGenres: getGenres,
        getActors: getActors,
        getDirectors: getDirectors,
        getWriters: getWriters,
        findMovies: findAll.bind(movies),
        findMovieByOriginalId: findMovieByOriginalId,
        getMovie: getMovie,

        findShow: findShow,
        findShows: findShows,
        storeShow: storeShow,
        findSeason: findSeason,
        findSeasons: findSeasons,
        storeSeason: storeSeason,
        findEpisode: findEpisode,
        findEpisodes: findEpisodes,
        storeEpisode: storeEpisode
    };
};