import {CallbackWithErrorAndArg} from '../../junk';
import {MovieLibrary} from './types';

const async = require('async');
let {wrap} = require('../../lib/async');
const uuid = require('node-uuid').v1;
const logger = require('log4js').getLogger('pith.plugins.library.database');

export class Repository {
    private readonly movies: any;
    private readonly people: any;
    private readonly keywords: any;
    private readonly genres: any;
    private readonly series: any;

    constructor(db) {
        this.movies = db.collection('movies');
        this.people = db.collection('people');
        this.keywords = db.collection('keywords');
        this.genres = db.collection('genres');
        this.series = db.collection('series');
    }

    insertOrUpdate(collection, entity, callback) {
        entity.modificationTime = new Date();
        if (entity._id) {
            collection.update({_id: entity._id}, {$set: entity}, callback);
        } else {
            if (!entity.id) {
                entity.id = uuid();
            }
            if (!entity.creationTime) {
                entity.creationTime = new Date();
            }
            collection.insert(entity, callback);
        }
    }

    findOrCreate(collection, query, callback);
    findOrCreate(collection, query, constructor, callback?) {
        if (typeof callback != 'function') {
            callback = constructor;
            constructor = (q, cb) => {
                cb(undefined, q);
            };
        }
        collection.findOne(query, (err, result) => {
            if (result) {
                callback(null, result);
            } else {
                constructor(query, (err, result) => {
                    collection.insert(result, (err, result) => {
                        callback(err, result && result[0]);
                    });
                });
            }
        });
    }

    getPerson(name, job, callback) {
        this.people.findOne({name: name}, (err, result) => {
            if (!result) {
                result = {name: name};
                result[job] = true;
                this.people.insert(result, (err, result) => {
                    callback(err, result && result[0]);
                });
            } else if (!result[job]) {
                const update = {};
                result[job] = true;
                update[job] = true;
                this.people.update({_id: result._id}, {$set: update}, err => {
                    callback(err, result);
                });
            } else {
                callback(null, result);
            }
        });
    }

    singleResult(callback) {
        return (err, result) => {
            if (!result || result.length === 0) {
                callback(false, null);
            } else if (result.length > 1) {
                callback('Expecting single result');
            } else {
                callback(false, result[0]);
            }
        };
    }

    getKeyword(name, callback) {
        this.findOrCreate(this.keywords, {name: name}, callback);
    }

    getGenre(name, callback) {
        this.findOrCreate(this.genres, {name: name}, callback);
    }

    _id(callback) {
        return (err, result) => {
            callback(err, result && result._id.toHexString());
        };
    }

    getActorId(name, callback) {
        this.getPerson(name, 'actor', this._id(callback));
    }

    getDirectorId(name, callback) {
        this.getPerson(name, 'director', this._id(callback));
    }

    getWriterId(name, callback) {
        this.getPerson(name, 'writer', this._id(callback));
    }

    getKeywordId(name, callback) {
        this.getKeyword(name, this._id(callback));
    }

    getGenreId(name, callback) {
        this.getGenre(name, this._id(callback));
    }

    storeMovie(item, callback) {
        const movie: any = {id: undefined};
        Object.assign(movie, item);

        movie.id = uuid();

        async.mapSeries(movie.actors, (val, cb) => this.getActorId(val, cb), (err, result) => {
            movie.actorIds = result;
            async.mapSeries(movie.keywords, (val, cb) => this.getKeywordId(val, cb), (err, result) => {
                movie.keywordIds = result;
                async.mapSeries(movie.genres, (val, cb) => this.getGenreId(val, cb), (err, result) => {
                    movie.genreIds = result;
                    this.insertOrUpdate(this.movies, movie, callback);
                });
            });
        });
    }

    storeShow(item, callback) {
        this.insertOrUpdate(this.series, item, callback);
    }

    findSeason(item, callback) {
        this.series.find({seasons: {$elemMatch: item}}, {'seasons.$': 1}).toArray((err, result) => {
            if (err) {
                callback(err);
            } else {
                callback(err, result[0] && result[0].seasons[0]);
            }
        });
    }

    findSeasons(item, sorting) {
        return this.series.find({id: item.showId}, {seasons: 1}).sort(sorting).toArray().catch(err => {
            logger.error(err);
        }).then(e => e[0].seasons);
    }

    storeSeason(item, callback) {
        this.series.updateOne({id: item.showId, seasons: {$elemMatch: item}}, {$set: {'seasons.$': item}}, (err, results) => {
            if (err) {
                callback(err);
            } else if (results.nMatched) {
                callback(err, results);
            } else {
                this.series.updateOne({id: item.showId}, {$push: {seasons: item}}, callback);
            }
        });
    }

    findEpisode(item, callback) {
        this.series.find(
            {episodes: {$elemMatch: item}},
            {episodes: {$elemMatch: item}}
        ).toArray((err, show) => {
            if (err) {
                callback(err);
            } else {
                callback(false, show[0] && show[0].episodes && show[0].episodes[0]);
            }
        });
    }

    findEpisodes(item, sort) {
        return this.series.aggregate([
                {$unwind: '$episodes'},
                {$replaceRoot: {newRoot: '$episodes'}},
                {$match: item},
                {$sort: sort}
            ]
        ).toArray();
    }

    storeEpisode(item, callback) {
        this.series.updateOne({
            id: item.showId,
            episodes: {$elemMatch: {season: item.season, episode: item.episode}}
        }, {$set: {'episodes.$': item}}, (err, result) => {
            if (err || result.matchedCount) {
                callback(err, result);
            } else {
                this.series.updateOne({
                    id: item.showId
                }, {$push: {'episodes': item}}, callback);
            }
        });
    }

    findShow(query, callback) {
        this.series.find(query).toArray(this.singleResult(callback));
    }

    getKeywords(callback) {
        this.keywords.find({}).toArray(callback);
    }

    getGenres(callback) {
        this.genres.find({}).toArray(callback);
    }

    getActors(callback) {
        this.people.find({actor: true}).toArray(callback);
    }

    getDirectors(callback) {
        this.people.find({director: true}).toArray(callback);
    }

    getWriters(callback) {
        this.people.find({writer: true}).toArray(callback);
    }

    findShows(selector, sorting) {
        return wrap(cb => this.series.find(selector).sort(sorting).toArray(cb));
    }

    findMovieByOriginalId(channelId, itemId, callback) {
        this.movies.find({channelId: channelId, originalId: itemId}).toArray(this.singleResult(callback));
    }

    getMovie(itemId, callback) {
        this.movies.find({id: itemId}, this.singleResult(callback));
    }

    findMovies(query, opts, callback: CallbackWithErrorAndArg<MovieLibrary.Movie[]>) {
        if (typeof opts === 'function') {
            callback = opts;
            opts = undefined;
        }
        const cursor = this.movies.find(query);
        if (opts && opts.order) {
            cursor.sort(opts.order);
        }
        if (opts && opts.limit) {
            cursor.limit(opts.limit);
        }
        return cursor.toArray(callback);
    }
}

