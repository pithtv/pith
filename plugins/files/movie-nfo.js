var fs = require("fs");
var parseNfo = require("./parsenfo");
var $path = require("path");
var parsefilename = require("../../lib/filenameparser");

module.exports = function getMetaData(channel, filepath, item, cb) {
    if(item.mimetype && item.mimetype.match(/^video\//)) {
        var nfoFile = $path.join($path.dirname(filepath), "movie.nfo");
        fs.exists(nfoFile, function(exists) {
            if(exists) {
                parseNfo(nfoFile, function(err, data) {
                    for(var x in data) {
                        item[x] = data[x];
                    }
                    cb();
                });
            } else {
                var plainNfoFile = filepath.replace(/\.[^.\/]*$/, ".nfo");
                fs.exists(plainNfoFile, function(exists) {
                    if(exists) {
                        fs.readFile(plainNfoFile, function(err, data) {
                            if(!err && data) {
                                var m = data.toString().match(/tt[0-9]{7,}/g);
                                if(m && m[0]) {
                                    item.imdbId = m[0];
                                }
                            }
                            cb();
                        });
                    } else {
                        // try to deduce info from the filename and directory
                        var meta = parsefilename(filepath);
                        if(meta) {
                            for(var x in meta) {
                                item[x] = meta[x];
                            }
                        }
                        cb();
                    }
                });
            }
        });  
    } else {
        cb();
    }
};