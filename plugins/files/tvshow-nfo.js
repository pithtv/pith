var async = require("async");
var fs = require("fs");
var parseNfo = require("./parsenfo");
var $path = require("path");
var parsefilename = require("../../lib/filenameparser");

function getMetaData(channel, filepath, item, cb) {
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
};

module.exports = {
    appliesTo: function(channel, filepath, item) {
        return item.type == 'container';
    },
    get: getMetaData
}