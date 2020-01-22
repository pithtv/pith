const async = require("async");
const fs = require("fs");
const parseNfo = require("./parsenfo");
const $path = require("path");

function getMetaData(channel, filepath, item, cb) {
    const nfo = $path.join(filepath, "tvshow.nfo");
    fs.stat(nfo, function(err) {
        if(!err) {
            parseNfo(nfo, function(err, result) {
                if(result) {
                    Object.asign(item, result);
                }
                cb(item);
            });
        } else {
            cb(item);
        }
    });
}

module.exports = {
    appliesTo: function(channel, filepath, item) {
        return item.type === 'container';
    },
    get: getMetaData
};
