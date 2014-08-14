var fs = require("fs");
var logger = require("console");
var mimetypes = require("../../lib/mimetypes");
var xml2js = require("xml2js").parseString;
var vidstreamer = require("../../lib/vidstreamer");
var async = require("async");

function FilesChannel(pith) {
    logger.trace("FilesChannel channel inited");
    this.rootDir = "/mnt/store/Public";
    this.pith = pith;
    
    var channel = this;
    
    vidstreamer.settings({
        getFile: function(path, cb) {
            cb(child(channel.rootDir, decodeURIComponent(path)));
        }
    });
    
    pith.handle.use('/stream', vidstreamer);
}

function child(dir, filename) {
    if(dir.match(/\/$/)) return dir + filename;
    else return dir + "/" + filename;
}

function parent(filename) {
    return filename.replace(/\/[^\/]*$/, '');
}

FilesChannel.prototype = {
    listContents: function(containerId, cb) {
        logger.trace("FilesChannel.listContents", containerId);
        var path = this.rootDir;
        var matchRootDir = new RegExp("^" + path);
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
                if(files.indexOf("movie.nfo") >= 0) {
                    files = files.filter(function(e) {
                        var extension = e.replace(/.*(\.[^.])/, '$1');
                        var mimetype = mimetypes[extension];
                        return mimetype && mimetype.match(/^video\//);
                    });
                }
                
                //TODO async
                async.map(files, function(file, cb) {
                    var filepath = child(path, file);
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
    
    parseNfo: function(path, cb) {
        fs.readFile(path, function(err, data) {
            if(err) {
                cb(err);
            } else {
                xml2js(data, function(err, metadata) {
                    var movie = metadata.movie;
                    var result = {};
                    for(var x in movie) {
                        var valueArr = movie[x];
                        var value = (valueArr && valueArr.length == 1) ? valueArr[0] : undefined;
                        
                        switch(x) {
                            case "title":
                            case "year":
                            case "rating":
                            case "plot":
                            case "tagline":
                                result[x] = value;
                                break;
                            case "genre":
                                result.genre = value.split(/ ?\/ ?/g);
                                break;
                        }
                    }
                    
                    cb(undefined, result);
                });
            }
        });
    },
    
    getItem: function(itemId, cb) {
        var filepath = child(this.rootDir, itemId);
        var channel = this;
        fs.stat(filepath, function(err, stats) {
            
            var item = {
                title: itemId.replace(/.*\//, ""),
                id: itemId
            };
    
            if(stats.isDirectory()) {
                item.type = 'container';
                cb(item);
            } else {
                item.type = 'file';
                var extension = itemId.replace(/.*(\.[^.])/, '$1');
                item.mimetype = mimetypes[extension];
                item.playable = item.mimetype && true;
                
                async.parallel([function(cb) {
                    var nfoFile = child(parent(filepath), "movie.nfo");
                    fs.exists(nfoFile, function(exists) {
                       if(exists) {
                           channel.parseNfo(nfoFile, function(err, data) {
                               for(var x in data) {
                                   item[x] = data[x];
                               }
                               cb();
                           });
                       } else {
                           cb();
                       }
                    });  
                }, function(cb) {
                    var tbnFile = child(parent(filepath), "movie.tbn");
                    fs.exists(tbnFile, function(exists) {
                        if(exists) {
                            var path = channel.rootDir;
                            var matchRootDir = new RegExp("^" + path);
                            var itemPath = tbnFile.replace(matchRootDir, '').split("/").map(encodeURIComponent).join("/");
                            item.thumbnail = channel.pith.rootUrl + "/stream/" + itemPath;
                        }
                        cb();
                    });
                }], function(err, result) {
                    cb(item);
                });
                
                
            }
        });
    },
    
    getStreamUrl: function(itemId, cb) {
        var channel = this;
        this.getLocalFile(itemId, function(localFile) {
            var itemPath = itemId.split("/").map(encodeURIComponent).join("/");
            cb(channel.pith.rootUrl + "/stream/" + itemPath);
        });
    }
};

module.exports.plugin = function() {
    return {
        init: function(opts) {
            logger.trace("FilesChannel plugin initing.");
            opts.pith.registerChannel({
                id: 'files',
                title: 'Files',
                type: 'channel',
                init: function(opts) {
                    return new FilesChannel(opts.pith);
                },
                sequence: 0
            });
        }
    };
};
