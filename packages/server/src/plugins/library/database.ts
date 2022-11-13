import {getLogger} from 'log4js';
import {v1 as uuid} from 'node-uuid';
import {mapSeries} from '../../lib/async';
import {Collection, DBDriver} from "../../persistence/DBDriver";
import {Episode, Season, Show} from "../../persistence/Schema";

const logger = getLogger('pith.plugins.library.database');

interface Document {
    _id?: string | { toHexString(): string }
}

export interface MovieDocument extends Document {
}

export interface PersonDocument extends Document {
    name?: string
}

export interface KeywordDocument extends Document {
}

export interface GenreDocument extends Document {
}

export interface ShowDocument extends Document {
    seasons: any[]
    episodes: any[]
}

export class Repository {
    private readonly movies: Collection<MovieDocument>;
    private readonly people: Collection<PersonDocument>;
    private readonly keywords: Collection<KeywordDocument>;
    private readonly genres: Collection<GenreDocument>;
    private readonly series: Collection<ShowDocument>;

    constructor(db: DBDriver) {
        this.movies = db.collection('movies');
        this.people = db.collection('people');
        this.keywords = db.collection('keywords');
        this.genres = db.collection('genres');
        this.series = db.collection('series') as Collection<ShowDocument>;
    }

    insertOrUpdate(collection: Collection<any>, entity): Promise<any> {
        entity.modificationTime = new Date();
        if (entity._id) {
            return collection.updateOne({_id: entity._id}, {$set: entity});
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
        let result: PersonDocument = await this.people.findOne({name});
        if (!result) {
            result = {name};
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
        return this.findOrCreate(this.keywords, {name});
    }

    getGenre(name) {
        return this.findOrCreate(this.genres, {name});
    }

    private _id(result) {
        if (!result || !result._id) {
            return undefined;
        }
        if (result._id.toHexString) {
            return result._id.toHexString();
        } else {
            return result._id;
        }
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

    findSeasons(item, sorting): Promise<Season[]> {
        return this.series.find({id: item.showId}, {sort: {seasons: 1}}).sort(sorting).toArray().catch(err => {
            logger.error(err);
        }).then(e => e[0].seasons);
    }

    async findEpisode(item) {
        const episode = await this.series.aggregate(
            [
                {$match: {seasons: {$elemMatch: {episodes: {$elemMatch: item}}}}},
                {$unwind: '$seasons'},
                {$replaceRoot: {newRoot: '$seasons'}},
                {$unwind: '$episodes'},
                {$replaceRoot: {newRoot: '$episodes'}},
                {$match: item}
            ]
        ).toArray();
        return episode[0];
    }

    findEpisodes(item, sort) : Promise<{show: Show, episode: Episode}[]> {
        return this.series.aggregate([
                {$match: {seasons: {$elemMatch: {episodes: {$elemMatch: item}}}}},
                {$unwind: '$seasons'},
                {$replaceRoot: {newRoot: '$seasons'}},
                {$unwind: '$episodes'},
                {$replaceRoot: {newRoot: '$episodes'}},
                {$match: item},
                {$sort: sort}
            ]
        ).toArray();
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
        return this.movies.findOne({channelId, originalId: itemId});
    }

    findMovies(query, opts?: { order: any, limit: number }) : Promise<MovieDocument[]> {
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

