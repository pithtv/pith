function mapMovie(e) {
    return {
        ...e,
        movieId: e.id,
        id: 'movies/' + e.id,
        duration: e.runtime * 60
    };
}

export default function (plugin) {
    const db = plugin.db;
    return [
        {
            id: 'movies',
            title: 'All movies',
            type: 'container',
            async _getContents(containerId) {
                if (containerId == null) {
                    let result = await db.findMovies({});
                    return result.map(mapMovie);
                } else {
                    return [];
                }
            },
            async _getItem(itemId) {
                if (itemId === null) {
                    return {id: 'movies', title: 'All Movies', sortableFields: ['title', 'year', 'rating', 'runtime', 'creationTime']};
                } else {
                    let result = await db.findMovies({id: itemId});
                    if (result[0]) {
                        return mapMovie(result[0]);
                    } else {
                        return {};
                    }
                }
            }
        },
        {
            id: 'actors',
            title: 'By actor',
            type: 'container',
            async _getContents(containerId) {
                if (containerId) {
                    let result = await db.findMovies({actorIds: containerId});
                    return result.map(mapMovie);
                } else {
                    let result = await db.getActors();
                    return result.map(e => ({
                        id: 'actors/' + e._id,
                        title: e.name,
                        type: 'container'
                    }));
                }
            }
        },
        {
            id: 'directors',
            title: 'By director',
            type: 'container',
            async _getContents(containerId) {
                if (containerId) {
                    let result = await db.findMovies({directorIds: containerId});
                    return result.map(mapMovie);
                } else {
                    let result = await db.getDirectors();
                    return result.map(e => ({
                        id: 'directors/' + e._id,
                        title: e.name,
                        type: 'container'
                    }));
                }
            }
        },
        {
            id: 'writers',
            title: 'By writer',
            type: 'container',
            async _getContents(containerId) {
                if (containerId) {
                    let result = await db.findMovies({writerIds: containerId});
                    return result.map(mapMovie);
                } else {
                    let result = await db.getWriters();
                    return result.map(e => ({
                        id: 'writers/' + e._id,
                        title: e.name,
                        type: 'container'
                    }));
                }
            }
        },
        {
            id: 'keywords',
            title: 'By keyword',
            type: 'container',
            async _getContents(containerId) {
                if (containerId) {
                    let result = await db.findMovies({keywordIds: containerId});
                    return result.map(mapMovie);
                } else {
                    let result = await db.getKeywords();
                    return result.map(e => ({
                        id: 'keywords/' + e._id,
                        title: e.name,
                        type: 'container'
                    }));
                }
            }
        },
        {
            id: 'genres',
            title: 'By genre',
            type: 'container',
            async _getContents(containerId) {
                if (containerId) {
                    let result = await db.findMovies({genreIds: containerId});
                    return result.map(mapMovie);
                } else {
                    let result = await db.getGenres();
                    return result.map(e => ({
                        id: 'genres/' + e._id,
                        title: e.name,
                        type: 'container'
                    }));
                }
            }
        },
        {
            id: 'recentlyadded',
            title: 'Recently Added',
            description: 'Movies added in the past 14 days',
            visible: true,
            type: 'container',
            sortableFields: ['title', 'year', 'rating', 'runtime', 'creationTime'],
            async _getContents() {
                let result = await db.findMovies({dateScanned: {$gt: new Date(new Date().getTime() - 14 * 24 * 60 * 60 * 1000)}}, {order: {dateScanned: -1}});
                return result.map(mapMovie);
            }
        },
        {
            id: 'recentlyreleased',
            title: 'Recently Released',
            description: 'Most recently released movies',
            visible: true,
            type: 'container',
            sortableFields: ['title', 'year', 'rating', 'runtime', 'creationTime'],
            async _getContents() {
                let result = await db.findMovies({}, {order: {releaseDate: -1}, limit: 50});
                return result.map(mapMovie);
            }
        }
    ];
}
