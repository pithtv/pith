var metadata = require("./metadata.tmdb.js");
var db = require("./database");
var async = require("async");

var settings = {
    containers: [
        {
            channel: 'files',
            containerId: '/Movies HD',
            oneMoviePerDirectory: true
        }
    ],
    
    scanInterval: 120 * 60 * 1000
};

function MoviesChannel(pithApp) {
    this.pithApp = pithApp;
    this.db = db(pithApp.db);
    this.scan();
}

var rootDirectories = [
    {
        id: "all",
        title: "All movies",
        type: "container",
        _getContents: function(db, containerId, cb) {
            db.getMovies({}, function(err, result) {
                cb(result);
            });
        }
    },
    {
        id: "actors",
        title: "By actor",
        type: "container",
        _getContents: function(db, containerId, cb) {
            if(containerId) {
                db.getMovies({actorIds: containerId}, function(err, result){
                    cb(result);
                });
            } else {
                db.getActors(function(err, result) {
                    if(err) {
                        console.log(err);
                    }
                    cb(result.map(function(e) {
                        return {
                            id: "actors/" + e._id,
                            title: e.name,
                            type: "container"
                        };
                    }));
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
                    cb(result);
                });
            } else {
                db.getDirectors(function(err, result) {
                    if(err) {
                        console.log(err);
                    }
                    cb(result.map(function(e) {
                        return {
                            id: "directors/" + e._id,
                            title: e.name,
                            type: "container"
                        };
                    }));
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
                    cb(result);
                });
            } else {
                db.getWriters(function(err, result) {
                    if(err) {
                        console.log(err);
                    }
                    cb(result.map(function(e) {
                        return {
                            id: "writers/" + e._id,
                            title: e.name,
                            type: "container"
                        };
                    }));
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
                    cb(result);
                });
            } else {
                db.getKeywords(function(err, result) {
                    if(err) {
                        console.log(err);
                    } else {
                        cb(result.map(function(e) {
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
                    cb(result);
                });
            } else {
                db.getGenres(function(err, result) {
                    if(err) {
                        console.log(err);
                    } else {
                        cb(result.map(function(e) {
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
    scan: function() {
        var channel = this;
        
        settings.containers.forEach(function(dir) {
            var channelInstance = channel.pithApp.getChannelInstance(dir.channel);
            
            function listContents(container, done) {
                channelInstance.listContents(container && container.id, function(contents) {
                    if(contents && contents.length) {
                        async.eachSeries(contents, function(item, cb) {
                            if(item.type == 'container') {
                               listContents(item, cb);
                            } else if(item.playable && item.mimetype.match(/^video\//)) {
                                
                                channel.db.findMovieByOriginalId(dir.channel, item.id, function(err, result) {
                                    if(!result) {
                                        console.log("Found new item " + item.id);
                                        
                                        item.modificationTime = container.modificationTime;
                                        item.creationTime = container.creationTime;
                                        item.backupTitle = container.title;
                                        
                                        channel.scanItem(item, function(err, result) {
                                            if(err) {
                                                cb();
                                            } else {
                                                result.originalId = item.id;
                                                result.channelId = dir.channel;
                                                result.id = item.id;
                                                result.dateScanned = new Date();
                                                channel.db.storeMovie(result, function(err) {
                                                    cb();
                                                });
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
            
            channelInstance.getItem(dir.containerId, function(container) {
                listContents(container, function() {
                    setTimeout(function() {
                        channel.scan();
                    }, settings.scanInterval); 
                });
            });
            
        });
        this.pithApp.getChannelInstance;
    },
    
    scanItem: function(item, cb) {
        metadata(item, cb);
    },
    
    listContents: function(containerId, cb) {
        if(!containerId) {
            cb(rootDirectories);
        } else {
            var i = containerId.indexOf('/');
            
            var directoryId = i > -1 ? containerId.substring(0,i) : containerId;
            
            var directory = rootDirectories.filter(function(e) {
                return e.id == directoryId; 
            })[0];
            
            directory._getContents(this.db, i > -1 ? containerId.substring(i+1) : null, cb);
        }
    },
    
    getStreamUrl: function(itemId, cb) {
        var channel = this;
        channel.db.getMovie(itemId, function(err, result) {
            if(err) {
                cb();
            } else {
                var targetChannel = channel.pithApp.getChannelInstance(result.channelId);
                targetChannel.getStreamUrl(itemId, cb);
            }
        });
    }
};

module.exports.plugin = function() {
    return {
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
};