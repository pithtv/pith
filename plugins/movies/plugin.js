var metadata = require("./metadata.tmdb.js");
var db = require("./database");
var async = require("async");
var winston = require("winston");
var global = require("../../lib/global")();
var Channel = require("../../lib/channel");

function MoviesChannel(pithApp) {
    Channel.apply(this);

    this.pithApp = pithApp;
    this.db = db(pithApp.db);
    var self = this;
    setTimeout(function() {
        self.scan();
    }, 10000);
}

function mapMovie(e) {
    e.movieId = e.id;
    e.id = "movies/" + e.id;
    return e;
}

var rootDirectories = [
    {
        id: "movies",
        title: "All movies",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId == '') {
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

MoviesChannel.prototype = {
    scan: function(manual) {
        var channel = this;

        winston.info("Starting movie library scan");
        var scanStartTime = new Date().getTime();

        async.eachSeries(global.settings.library.folders.filter(function(c) {
            return c.contains === 'movies' && (c.scanAutomatically || manual === true);
        }), function(dir, cb) {
            var channelInstance = channel.pithApp.getChannelInstance(dir.channelId);

            function listContents(container, done) {
                if(container) {
                    channelInstance.listContents(container && container.id, function (err, contents) {
                        if (err) {
                            done(err);
                        }
                        if (contents && contents.length) {
                            async.eachSeries(contents, function (item, cb) {
                                if (item.type == 'container') {
                                    listContents(item, cb);
                                } else if (item.playable && item.mimetype.match(/^video\//)) {

                                    channel.db.findMovieByOriginalId(dir.channelId, item.id, function (err, result) {
                                        if (!result) {
                                            winston.info("Found new item " + item.id);

                                            item.modificationTime = container.modificationTime;
                                            item.creationTime = container.creationTime;

                                            function store(result) {
                                                result.originalId = item.id;
                                                result.channelId = dir.channelId;
                                                result.id = item.id;
                                                result.dateScanned = new Date();
                                                channel.db.storeMovie(result, function (err) {
                                                    cb();
                                                });
                                            }

                                            channel.scanItem(item, function (err, result) {
                                                if (err) {
                                                    item.title = container.title;
                                                    channel.scanItem(item, function (err, result) {
                                                        if (err) cb();
                                                        else store(result);
                                                    });
                                                } else {
                                                    store(result);
                                                }
                                            });
                                        } else {
                                            cb();
                                        }
                                    });
                                } else {
                                    cb();
                                }
                            }, done);
                        } else {
                            done();
                        }
                    });
                }
            }

            channelInstance.getItem(dir.containerId, function (err, container) {
                listContents(container, cb);
            });
        }, function(err) {
            var scanEndTime = new Date().getTime();
            winston.info("Movie library scan complete. Took %d ms", (scanEndTime - scanStartTime));
            setTimeout(function () {
                channel.scan();
            }, global.settings.library.scanInterval);
        });
    },
    
    scanItem: function(item, cb) {
        metadata(item, cb);
    },
    
    listContents: function(containerId, cb) {
        if(!containerId) {
            cb(null, rootDirectories);
        } else {
            var i = containerId.indexOf('/');
            
            var directoryId = i > -1 ? containerId.substring(0,i) : containerId;
            
            var directory = rootDirectories.filter(function(e) {
                return e.id == directoryId; 
            })[0];
            
            directory._getContents(this.db, i > -1 ? containerId.substring(i+1) : null, cb);
        }
    },
    
    getItem: function(itemId, cb) {
        if(!itemId) {
            cb(null, { title: "Movies" });
        } else {
            var i = itemId.indexOf('/');
            
            var directoryId = i > -1 ? itemId.substring(0,i) : itemId;
            
            var directory = rootDirectories.filter(function(e) {
                return e.id == directoryId; 
            })[0];
            
            if(!directory) {
                cb(Error("Not found"));
                return;
            }
            
            if(directory._getItem) {
                directory._getItem(this.db, i > -1 ? itemId.substring(i+1).replace(/\/$/,'') : null, cb);
            } else {
                cb(null, { id: itemId });
            }
        }
    },
    
    getStream: function(item, cb) {
        var channel = this;
        var targetChannel = channel.pithApp.getChannelInstance(item.channelId);
        targetChannel.getItem(item.originalId, function(err, item) {
            if(err) {
                cb(err);
            } else {
                targetChannel.getStream(item, cb);
            }
        });
    },
    
    getLastPlayState: function(itemId, cb) {
        var self = this;
        this.getItem(itemId, function(err, item) {
            if(item && item.playable) {
                var targetChannel = self.pithApp.getChannelInstance(item.channelId);
                targetChannel.getLastPlayState(item.originalId, cb);
            } else {
                cb(err, item);
            }
        });
    },
    
    putPlayState: function(itemId, state, cb) {
        var self = this;
        this.getItem(itemId, function(err, item) {
            if(err || item === undefined) {
                if(cb) cb(err);
                return;
            }
            var targetChannel = self.pithApp.getChannelInstance(item.channelId);
            targetChannel.putPlayState(item.originalId, state, cb);
        });
    }
};

module.exports = {
    init: function(opts) {
        var instance = new MoviesChannel(opts.pith);

        opts.pith.registerChannel({
            id: 'movies',
            title: 'Movies',
            type: 'channel',
            init: function(opts) {
                return instance;
            },
            sequence: 2
        });
    }
};