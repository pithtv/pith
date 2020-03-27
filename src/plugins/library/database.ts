import {Collection} from 'mongodb';
import {getLogger} from 'log4js';
import {v1 as uuid} from 'node-uuid';
import {mapSeries} from '../../lib/async';

const logger = getLogger('pith.plugins.library.database');

export class Repository {
    private readonly movies: Collection;
    private readonly people: Collection;
    private readonly keywords: Collection;
    private readonly genres: Collection;
    private readonly series: Collection;

    constructor(db) {
        this.movies = db.collection('movies');
        this.people = db.collection('people');
        this.keywords = db.collection('keywords');
        this.genres = db.collection('genres');
        this.series = db.collection('series');
    }

    insertOrUpdate(collection, entity): Promise<any> {
        entity.modificationTime = new Date();
        if (entity._id) {
            return collection.update({_id: entity._id}, {$set: entity});
        } else {
            if (!entity.id) {
                entity.id = uuid();
            }
            if (!entity.creationTime) {
                entity.creationTime = new Date();
            }
            return collection.insertOne(entity);
        }
    }

    async findOrCreate(collection, query, constructor?: (query: any) => Promise<any>) {
        let result = await collection.findOne(query);
        if (result) {
            return result;
        }
        result = constructor ? await constructor(query) : query;
        const r = await collection.insertOne(result);
        return r.ops[0];
    }

    async getCreateOrUpdatePersonWithJob(name, job) {
        let result = await this.people.findOne({name: name});
        if (!result) {
            result = {name: name};
            result[job] = true;
            await this.people.insertOne(result);
            return result;
        } else if (!result[job]) {
            const update = {};
            result[job] = true;
            update[job] = true;
            await this.people.updateOne({_id: result._id}, {$set: update});
            return result;
        } else {
            return result;
        }
    }

    getKeyword(name) {
        return this.findOrCreate(this.keywords, {name: name});
    }

    getGenre(name) {
        return this.findOrCreate(this.genres, {name: name});
    }

    private _id(result) {
        return result && result._id.toHexString();
    }

    async getActorId(name) {
        return this._id(await this.getCreateOrUpdatePersonWithJob(name, 'actor'));
    }

    async getKeywordId(name) {
        return this._id(await this.getKeyword(name));
    }

    async getGenreId(name) {
        return this._id(await this.getGenre(name));
    }

    async storeMovie(item) {
        const movie: any = {id: undefined};
        Object.assign(movie, item);

        movie.id = uuid();

        movie.actorIds = await mapSeries(movie.actors, (val) => this.getActorId(val));
        movie.keywordIds = await mapSeries(movie.keywords, val => this.getKeywordId(val));
        movie.genreIds = await mapSeries(movie.genres, (val) => this.getGenreId(val));
        await this.insertOrUpdate(this.movies, movie);
    }

    storeShow(item) {
        return this.insertOrUpdate(this.series, item);
    }

    async findSeason(item) {
        const result = await this.series.find({seasons: {$elemMatch: item}}, {sort: {'seasons.$': 1}}).toArray();
        return result[0] && result[0].seasons[0];
    }

    findSeasons(item, sorting) {
        return this.series.find({id: item.showId}, {sort: {seasons: 1}}).sort(sorting).toArray().catch(err => {
            logger.error(err);
        }).then(e => e[0].seasons);
    }

    async storeSeason(item) {
        const results = await this.series.updateOne({id: item.showId, seasons: {$elemMatch: item}}, {$set: {'seasons.$': item}});
        if (results.matchedCount) {
            return results;
        } else {
            return await this.series.updateOne({id: item.showId}, {$push: {seasons: item}});
        }
    }

    async findEpisode(item) {
        const show = await this.series.find(
            {episodes: {$elemMatch: item}},
            {projection: {episodes: {$elemMatch: item}}}
        ).toArray();
        return show[0] && show[0].episodes && show[0].episodes[0];
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

    async storeEpisode(item) {
        const result = await this.series.updateOne({
            id: item.showId,
            episodes: {$elemMatch: {season: item.season, episode: item.episode}}
        }, {$set: {'episodes.$': item}});
        if (result.matchedCount) {
            return result;
        } else {
            return await this.series.updateOne({
                id: item.showId
            }, {$push: {'episodes': item}});
        }
    }

    findShow(query) {
        return this.series.findOne(query);
    }

    getKeywords() {
        return this.keywords.find({}).toArray();
    }

    getGenres() {
        return this.genres.find({}).toArray();
    }

    getActors() {
        return this.people.find({actor: true}).toArray();
    }

    getDirectors() {
        return this.people.find({director: true}).toArray();
    }

    getWriters() {
        return this.people.find({writer: true}).toArray();
    }

    findShows(selector, sorting) {
        return this.series.find(selector).sort(sorting).toArray();
    }

    findMovieByOriginalId(channelId, itemId) {
        return this.movies.findOne({channelId: channelId, originalId: itemId});
    }

    findMovies(query, opts?: { order: any, limit: number }) {
        const cursor = this.movies.find(query);
        if (opts && opts.order) {
            cursor.sort(opts.order);
        }
        if (opts && opts.limit) {
            cursor.limit(opts.limit);
        }
        return cursor.toArray();
    }
}

