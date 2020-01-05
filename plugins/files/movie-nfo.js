const fs = require("fs");
const parseNfo = require("./parsenfo");
const $path = require("path");
const parsefilename = require("../../lib/filenameparser");

module.exports = {
    appliesTo: function(channel, filepath, item) {
        return item.type === 'file';
    },
    get: function getMetaData(channel, filepath, item, cb) {
        if(item.mimetype && item.mimetype.match(/^video\//)) {
            const nfoFile = $path.join($path.dirname(filepath), "movie.nfo");
            fs.stat(nfoFile, function(err) {
                if(!err) {
                    parseNfo(nfoFile, function(err, data) {
                        Object.assign(item, data);
                        cb();
                    });
                } else {
                    const plainNfoFile = filepath.replace(/\.[^.\/]*$/, ".nfo");
                    fs.stat(plainNfoFile, function(err) {
                        if(!err) {
                            fs.readFile(plainNfoFile, function(err, data) {
                                if(!err && data) {
                                    const m = data.toString().match(/tt[0-9]{7,}/g);
                                    if(m && m[0]) {
                                        item.imdbId = m[0];
                                    }
                                }
                                cb();
                            });
                        } else {
                            // try to deduce info from the filename and directory
                            const meta = parsefilename(filepath);
                            if(meta) {
                                Object.assign(item, meta);
                            }
                            cb();
                        }
                    });
                }
            });
        } else {
            cb();
        }
    }
};
