const fs = require("fs");
const $path = require("path");

module.exports = {
    appliesTo: function(channel, filepath, item) {
        return item.type === 'container';
    },
    get: function findThumbnails(channel, filepath, item, cb) {
        const tbnFile = $path.resolve(filepath, "fanart.jpg");
        fs.stat(tbnFile, function(err) {
            if(!err) {
                const itemPath = $path.relative(channel.rootDir, tbnFile).split($path.sep).map(encodeURIComponent).join("/");
                item.backdrop = channel.pith.rootPath + "/stream/" + itemPath;
            }
            cb();
        });
    }
};
