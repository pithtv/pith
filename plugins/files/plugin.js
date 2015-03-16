var fs = require("fs");
var mimetypes = require("../../lib/mimetypes");
var vidstreamer = require("../../lib/vidstreamer");
var async = require("async");
var $path = require("path");
var settings = require("../../lib/global")().settings;
var playstate = require("./playstate");
var ff = require("fluent-ffmpeg");
var Channel = require("../../lib/channel");

var metaDataProviders = [
    require("./movie-nfo"),
//    require("./tvshow-nfo"),
    require("./thumbnails"),
    require("./fanart")
];

function FilesChannel(pith, statestore) {
    Channel.apply(this);

    this.rootDir = settings.files.rootDir;
    this.pith = pith;
    
    var channel = this;
    
    this.statestore = statestore;
    
    vidstreamer.settings({
        getFile: function(path, cb) {
            cb(channel.getFile(path));
        }
    });
    
    pith.handle.use('/stream', vidstreamer);
}

FilesChannel.prototype = {
    listContents: function(containerId, cb) {
        var rootDir = this.rootDir, path;
        if(containerId) {
            path = $path.resolve(rootDir, containerId);
        } else {
            path = rootDir;
        }
        
        var filesChannel = this;
        
        fs.readdir(path, function(err, files) {
            if(err) {
                cb(err);
            } else {
                async.map(files.filter(function(e) {
                    return (e[0] != "." || settings.files.showHiddenFiles) && settings.files.excludeExtensions.indexOf($path.extname(e)) == -1;
                }), function(file, cb) {
                    var filepath = $path.resolve(path, file);
                    var itemId = $path.relative(rootDir, filepath);
                    filesChannel.getItem(itemId, false,function(err, item) {
                        cb(err, item);
                    });
                }, function(err, contents) {
                    cb(err, contents.filter(function(e) { return e !== undefined; }));
                });
            }
        });
    },

    getFile: function(path, cb) {
        return $path.resolve(this.rootDir, decodeURIComponent(path));
    },
    
    getItem: function(itemId, detailed, cb) {
        if(typeof detailed === 'function') {
            cb = detailed;
            detailed = true;
        }
        
        var filepath = $path.resolve(this.rootDir, itemId);
        var channel = this;
        fs.stat(filepath, function(err, stats) {
            var item = {
                title: $path.basename(itemId),
                id: itemId
            };

            if(stats && stats.isDirectory()) {
                item.type = 'container';
            } else {
                item.type = 'file';
                var extension = $path.extname(itemId);
                item.mimetype = mimetypes[extension];
                item.playable = item.mimetype && true;
                
                item.fileSize = stats && stats.size;
                item.modificationTime = stats && stats.mtime;
                item.creationTime = stats && stats.ctime;
                item.fsPath = filepath;
            }
            
            var applicableProviders = metaDataProviders.filter(function(f) {
                return f.appliesTo(channel, filepath, item);
            });
            
            if(applicableProviders.length) {
                async.parallel(applicableProviders.map(function(f) {
                    return function(cb) {
                        f.get(channel, filepath, item, cb);
                    };
                }), function() {
                    cb(null, item);
                });
            } else {
                cb(null, item);
            }
        });
    },
    
    getStream: function(item, cb) {
        var channel = this;
        var itemId = item.id;
        var itemPath = itemId.split($path.sep).map(encodeURIComponent).join("/");
        ff.ffprobe(this.getFile(item.id), function(err, metadata) {
            if(err) {
                cb(err);
                return;
            }
            var desc = {
                url: channel.pith.rootUrl + "stream/" + itemPath,
                mimetype: item.mimetype
            };

            if(!err) {
                desc.duration = parseFloat(metadata.format.duration) * 1000;
            }

            cb(false, desc);
        });
    },
    
    getLastPlayState: function(itemId, cb) {
        cb(null, this.statestore.get(itemId));
    },
    
    putPlayState: function(itemId, state, cb) {
        try {
            state.id = itemId;
            this.statestore.put(state);
            if(cb) cb(false, "OK");
        } catch(e) {
            if(cb) cb(e);
        }
    }
};

module.exports = {
    init: function(opts) {
        playstate(opts.pith.db, function(err, statestore) {
            opts.pith.registerChannel({
                id: 'files',
                title: 'Files',
                type: 'channel',
                init: function(opts) {
                    return new FilesChannel(opts.pith, statestore);
                },
                sequence: 0
            });
        });
    },

    metaDataProviders: metaDataProviders
};
