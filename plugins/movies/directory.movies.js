function mapMovie(e) {
    e.movieId = e.id;
    e.id = "movies/" + e.id;
    return e;
}

module.exports = [
    {
        id: "movies",
        title: "All movies",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId == null) {
                db.getMovies({}, function (err, result) {
                    cb(err, result.map(mapMovie));
                });
            } else {
                cb(null, []);
            }
        },
        _getItem: function(db, itemId, cb) {
            if(itemId === null) {
                cb(null, {id: 'movies', title: 'All Movies'});
            } else {
                db.getMovies({id: itemId}, function (err, result) {
                    if (err) {
                        cb(err);
                    } else {
                        if (result[0]) {
                            cb(null, mapMovie(result[0]));
                        } else {
                            cb(null, undefined);
                        }
                    }
                });
            }
        }
    },
    {
        id: "actors",
        title: "By actor",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId) {
                db.getMovies({actorIds: containerId}, function(err, result){
                    cb(err, result.map(mapMovie));
                });
            } else {
                db.getActors(function(err, result) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, result.map(function(e) {
                            return {
                                id: "actors/" + e._id,
                                title: e.name,
                                type: "container"
                            };
                        }));
                    }
                });
            }
        }
    },
    {
        id: "directors",
        title: "By director",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId) {
                db.getMovies({directorIds: containerId}, function(err, result){
                    cb(err, result.map(mapMovie));
                });
            } else {
                db.getDirectors(function(err, result) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, result.map(function(e) {
                            return {
                                id: "directors/" + e._id,
                                title: e.name,
                                type: "container"
                            };
                        }));
                    }
                });
            }
        }
    },
    {
        id: "writers",
        title: "By writer",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId) {
                db.getMovies({writerIds: containerId}, function(err, result){
                    cb(err, result.map(mapMovie));
                });
            } else {
                db.getWriters(function(err, result) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, result.map(function(e) {
                            return {
                                id: "writers/" + e._id,
                                title: e.name,
                                type: "container"
                            };
                        }));
                    }
                });
            }
        }
    },
    {
        id: "keywords",
        title: "By keyword",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId) {
                db.getMovies({keywordIds: containerId}, function(err, result) {
                    cb(err, result.map(mapMovie));
                });
            } else {
                db.getKeywords(function(err, result) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, result.map(function(e) {
                            return {
                                id: "keywords/" + e._id,
                                title: e.name,
                                type: "container"
                            };
                        }));
                    }
                });
            }
        }
    },
    {
        id: "genres",
        title: "By genre",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId) {
                db.getMovies({genreIds: containerId}, function(err, result) {
                    cb(err, result.map(mapMovie));
                });
            } else {
                db.getGenres(function(err, result) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, result.map(function(e) {
                            return {
                                id: "genre/" + e._id,
                                title: e.name,
                                type: "container"
                            };
                        }));
                    }
                });
            }
        }
    }
];
