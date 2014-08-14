var metadata = require("./metadata.tmdb.js");
var async = require("async");

var settings = {
    containers: [
    {
        channel: 'files',
        containerId: '/Movies HD'
    }
    ],
    
    scanInterval: 30 * 60 * 1000
};

function MoviesChannel(pithApp) {
    this.pithApp = pithApp;
    this.movies = pithApp.db.collection("movies");
    this.scan();
}

var rootDirectories = [
    {
        id: "all",
        title: "All movies",
        type: "container",
        _getContents: function(movies, containerId, cb) {
            return movies.find({}).toArray(function(err, result) {
                cb(result);
            });
        }
    }
];

MoviesChannel.prototype = {
    scan: function() {
        var channel = this;
        
        settings.containers.forEach(function(container) {
            var channelInstance = channel.pithApp.getChannelInstance(container.channel);
            
            function listContents(containerId, done) {
                channelInstance.listContents(containerId, function(contents) {
                    async.eachSeries(contents, function(item, cb) {
                        if(item.type == 'container') {
                           listContents(item.id, cb);
                        } else if(item.playable && item.mimetype.match(/^video\//)) {
                            channel.movies.findOne({
                                id: item.id,
                                channelId: container.channel
                            }, function(err, result) {
                                if(!result) {
                                    console.log("Found new item " + item.id);   
                                    channel.scanItem(item, function(err, result) {
                                        if(err) {
                                            cb();
                                        } else {
                                            result.id = item.id;
                                            result.channelId = container.channel;
                                            channel.movies.insert(result, function(err) {
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
                });
            }
            
            listContents(container.containerId, function() {
                setTimeout(function() {
                    channel.scan();
                }, settings.scanInterval); 
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
            var container = rootDirectories.filter(function(e) {
                return e.id == containerId; 
            })[0];
            
            container._getContents(this.movies, containerId, cb);
        }
    },
    
    getStreamUrl: function(itemId, cb) {
        var channel = this;
        channel.movies.findOne({id: itemId}, function(err, result) {
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