var fs = require("fs");
var mimetypes = require("../../lib/mimetypes");
var vidstreamer = require("../../lib/vidstreamer");
var async = require("async");
var $path = require("path");
var parseNfo = require("./parsenfo");

var metaDataProviders = [
    require("./movie-nfo"),
//    require("./tvshow-nfo"),
    require("./thumbnails")
];

function FilesChannel(pith) {
    this.rootDir = "/mnt/store/Public";
    this.pith = pith;
    
    var channel = this;
    
    vidstreamer.settings({
        getFile: function(path, cb) {
            cb($path.join(channel.rootDir, decodeURIComponent(path)));
        }
    });
    
    pith.handle.use('/stream', vidstreamer);
}

FilesChannel.prototype = {
    listContents: function(containerId, cb) {
        var path = this.rootDir;
        var matchRootDir = new RegExp("^" + path + "\\/");
        if(containerId) {
            if(path.match(/\/$/)===null) {
                path += "/";
            }
            path = path + containerId;
            if(path.match(/\/$/)===null) {
                path += "/";
            }
        }
        
        var filesChannel = this;
        
        fs.readdir(path, function(err, files) {
            if(err) {
                cb(null);
            } else {
                async.map(files, function(file, cb) {
                    var filepath = $path.join(path, file);
                    var itemId = filepath.replace(matchRootDir, "");
                    filesChannel.getItem(itemId, function(item) {
                        cb(undefined, item);
                    });
                }, function(err, contents) {
                    cb(contents);
                });
            }
        });
    },
    
    getItem: function(itemId, detailed, cb) {
        if(typeof detailed === 'function') {
            cb = detailed;
            detailed = false;
        }
        
        var filepath = $path.join(this.rootDir, itemId);
        var channel = this;
        fs.stat(filepath, function(err, stats) {
            
            var item = {
                title: itemId.replace(/.*\//, ""),
                id: itemId
            };
    
            if(stats.isDirectory()) {
                item.type = 'container';
                
                if(detailed) {
                    var nfo = $path.join(filepath, "tvshow.nfo");
                    fs.exists(nfo, function(exists) {
                        if(exists) {
                            parseNfo(nfo, function(err, result) {
                                if(result) {
                                    for(var x in result) {
                                        item[x] = result[x];
                                    }
                                }
                                cb(item);
                            });
                        } else {
                            cb(item);
                        }
                    });
                } else {
                    cb(item);
                }
            } else {
                item.type = 'file';
                var extension = itemId.replace(/.*(\.[^.])/, '$1');
                item.mimetype = mimetypes[extension];
                item.playable = item.mimetype && true;
                
                item.fileSize = stats.size;
                item.modificationTime = stats.mtime;
                item.creationTime = stats.ctime;
                
                async.parallel(metaDataProviders.map(function(f) {
                    return function(cb) {
                        f(channel, filepath, item, cb);
                    };
                }), function() {
                    cb(item);
                });
                
            }
        });
    },
    
    getStreamUrl: function(itemId, cb) {
        var channel = this;
        var itemPath = itemId.split("/").map(encodeURIComponent).join("/");
        cb(channel.pith.rootUrl +  "/stream/" + itemPath);
    }
};

module.exports.plugin = function() {
    return {
        init: function(opts) {
            opts.pith.registerChannel({
                id: 'files',
                title: 'Files',
                type: 'channel',
                init: function(opts) {
                    return new FilesChannel(opts.pith);
                },
                sequence: 0
            });
        },
        
        metaDataProviders: metaDataProviders
    };
};
