import * as async from '../../lib/async';
import {MovieLibrary} from './types';

function mapMovie(e) {
    e.movieId = e.id;
    e.id = "movies/" + e.id;
    return e;
}

export default function (plugin) {
    const db = plugin.db;
    return [
        {
            id: "movies",
            title: "All movies",
            type: "container",
            async _getContents(containerId) {
                if (containerId == null) {
                    let result = await async.wrap<MovieLibrary.Movie[]>(cb=> db.findMovies({}, cb));
                    return result.map(mapMovie);
                } else {
                    return [];
                }
            },
            async _getItem(itemId) {
                if (itemId === null) {
                    return {id: 'movies', title: 'All Movies'};
                } else {
                    let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({id: itemId}, cb));
                    if (result[0]) {
                        return mapMovie(result[0]);
                    } else {
                        return {};
                    }
                }
            }
        },
        {
            id: "actors",
            title: "By actor",
            type: "container",
            async _getContents(containerId) {
                if (containerId) {
                    let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({actorIds: containerId}, cb));
                    return result.map(mapMovie);
                } else {
                    let result = await async.wrap<MovieLibrary.Actor[]>(cb => db.getActors(cb));
                    return result.map(e => ({
                        id: "actors/" + e._id,
                        title: e.name,
                        type: "container"
                    }));
                }
            }
        },
        {
            id: "directors",
            title: "By director",
            type: "container",
            async _getContents(containerId) {
                if (containerId) {
                    let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({directorIds: containerId}, cb));
                    return result.map(mapMovie);
                } else {
                    let result = await async.wrap<MovieLibrary.Director[]>(cb => db.getDirectors(cb));
                    return result.map(e => ({
                        id: "directors/" + e._id,
                        title: e.name,
                        type: "container"
                    }));
                }
            }
        },
        {
            id: "writers",
            title: "By writer",
            type: "container",
            async _getContents(containerId) {
                if (containerId) {
                    let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({writerIds: containerId}, cb));
                    return result.map(mapMovie);
                } else {
                    let result = await async.wrap<MovieLibrary.Writer[]>(cb => db.getWriters(cb));
                    return result.map(e => ({
                        id: "writers/" + e._id,
                        title: e.name,
                        type: "container"
                    }));
                }
            }
        },
        {
            id: "keywords",
            title: "By keyword",
            type: "container",
            async _getContents(containerId) {
                if (containerId) {
                    let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({keywordIds: containerId}, cb));
                    return result.map(mapMovie);
                } else {
                    let result = await async.wrap<MovieLibrary.Keyword[]>(cb => db.getKeywords(cb));
                    return result.map(e => ({
                        id: "keywords/" + e._id,
                        title: e.name,
                        type: "container"
                    }));
                }
            }
        },
        {
            id: "genres",
            title: "By genre",
            type: "container",
            async _getContents(containerId) {
                if (containerId) {
                    let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({genreIds: containerId}, cb));
                    return result.map(mapMovie);
                } else {
                    let result = await async.wrap<MovieLibrary.Genre[]>(cb => db.getGenres(cb));
                    return result.map(e => ({
                        id: "genres/" + e._id,
                        title: e.name,
                        type: "container"
                    }));
                }
            }
        },
        {
            id: "recentlyadded",
            title: "Recently Added",
            description: "Movies added in the past 14 days",
            visible: true,
            type: "container",
            async _getContents() {
                let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({dateScanned: {$gt: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)}}, {order: {dateScanned: -1}}, cb));
                return result.map(mapMovie);
            }
        },
        {
            id: "recentlyreleased",
            title: "Recently Released",
            description: "Most recently released movies",
            visible: true,
            type: "container",
            async _getContents() {
                let result = await async.wrap<MovieLibrary.Movie[]>(cb => db.findMovies({}, {order: {releaseDate: -1}, limit: 50}, cb));
                return result.map(mapMovie);
            }
        }
    ];
};
