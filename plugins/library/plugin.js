"use strict";

var metadata = require("./metadata.tmdb.js");
var db = require("./database");
var async = require("async");
var asyncPromise = require("../../lib/async");
var winston = require("winston");
var global = require("../../lib/global")();
var Channel = require("../../lib/channel");
var wrapToPromise = require("../../lib/util").wrapToPromise;

var moviesDirectory = require("./directory.movies");
var showsDirectory = require("./directory.shows");

function LibraryChannel(pithApp, directoryFactory) {
    Channel.apply(this);

    this.pithApp = pithApp;
    this.db = db(pithApp.db);

    this.directory = directoryFactory(this);
}

function wrap(resolve, reject) {
    return (err, result) => {
        if(err) reject(err);
        else resolve(result);
    }
}

LibraryChannel.prototype = {
    listContents: function(containerId) {
        if(!containerId) {
            return Promise.resolve(this.directory.filter(function(d) {
                return d.visible !== false;
            }));
        } else {
            var i = containerId.indexOf('/');
            
            var directoryId = i > -1 ? containerId.substring(0,i) : containerId;
            
            var directory = this.directory.filter(function(e) {
                return e.id == directoryId; 
            })[0];
            
            return new Promise((resolve, reject) => {
                directory._getContents(i > -1 ? containerId.substring(i+1) : null, wrap(resolve, reject));
            });
        }
    },

    listContentsWithPlayStates: function(path) {
        var self = this;
        return this.listContents(path).then(function(contents) {
            return asyncPromise.map(contents, function (item, cb) {
                if(item.playState != null) {
                    cb(false, item);
                } else {
                    self.getLastPlayStateFromItem(item, function (err, state) {
                        item.playState = state;
                        cb(err, item);
                    });
                }
            });
        });
    },
    
    getItem: function(itemId) {
        if(!itemId) {
            return Promise.resolve({ title: "Movies" });
        } else {
            var i = itemId.indexOf('/');
            
            var directoryId = i > -1 ? itemId.substring(0,i) : itemId;
            
            var directory = this.directory.filter(function(e) {
                return e.id == directoryId; 
            })[0];
            
            if(!directory) {
                return Promise.reject(Error("Not found"));
            }
            
            if(directory._getItem) {
                return wrapToPromise(cb => {
                    directory._getItem(i > -1 ? itemId.substring(i+1).replace(/\/$/,'') : null, cb);
                });
            } else {
                return Promise.resolve({id: itemId});
            }
        }
    },
    
    getStream: function(item) {
        var channel = this;
        var targetChannel = channel.pithApp.getChannelInstance(item.channelId);
        return targetChannel.getItem(item.originalId).then(item => targetChannel.getStream(item));
    },

    getLastPlayStateFromItem: function(item, cb) {
        if(item && item.originalId) {
            var targetChannel = this.pithApp.getChannelInstance(item.channelId);
            targetChannel.getLastPlayState(item.originalId, cb);
        } else {
            cb(false);
        }
    },
    
    getLastPlayState: function(itemId, cb) {
        var self = this;
        this.getItem(itemId, function(err, item) {
            if(err) cb(err);
            else self.getLastPlayStateFromItem(item, cb);
        });
    },
    
    putPlayState: function(itemId, state, cb) {
        var self = this;
        this.getItem(itemId, function(err, item) {
            if(err || item == undefined) {
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
        var self = this, pith = opts.pith;
        var moviesChannel = new LibraryChannel(opts.pith, moviesDirectory);
        var showsChannel = new LibraryChannel(opts.pith, showsDirectory);

        // set up scanners
        var scannerOpts = {
            db: db(opts.pith.db)
        };
        var scanners = {
            movies: require("./scanner.movie")(scannerOpts),
            tvshows: require("./scanner.tvshow")(scannerOpts)
        };
        setTimeout(function() {
            self.scan();
        }, 10000);

        this.scan = function(manual) {
            var plug = this;

            winston.info("Starting library scan");
            var scanStartTime = new Date().getTime();

            async.eachSeries(global.settings.library.folders.filter(function(c) {
                return scanners[c.contains] !== undefined && (c.scanAutomatically || manual === true);
            }), function(dir, cb) {
                var channelInstance = pith.getChannelInstance(dir.channelId);
                if(channelInstance !== undefined) {
                    scanners[dir.contains].scan(channelInstance, dir, cb);
                }
            }, function(err) {
                var scanEndTime = new Date().getTime();
                winston.info("Library scan complete. Took %d ms", (scanEndTime - scanStartTime));
                setTimeout(function () {
                    plug.scan();
                }, global.settings.library.scanInterval);
            });
        };

        opts.pith.registerChannel({
            id: 'movies',
            title: 'Movies',
            type: 'channel',
            init: function(opts) {
                return moviesChannel;
            },
            sequence: 2
        });

        opts.pith.registerChannel({
            id: 'shows',
            title: 'Shows',
            type: 'channel',
            init: function(opts) {
                return showsChannel;
            }
        });

    }
};