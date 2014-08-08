var fs = require("fs");
var vidstreamer = require("../../lib/vidstreamer");
var logger = require("console");

function FilesChannel(pith) {
    logger.trace("FilesChannel channel inited");
    this.rootDir = "/media/DATA";
    this.pith = pith;
}

FilesChannel.prototype = {
    listContents: function(containerId, cb) {
        logger.trace("FilesChannel.listContents", containerId);
        var path = this.rootDir;
        if(containerId != null) {
            path = path + containerId;
        }
        
        fs.readDir(path, function(err, files) {
            cb(files.map(function(file) {
                var filepath = path + "/" + file;
                var stats = fs.statSync(filepath);
                var item = {
                    title: file,
                    containerId: containerId,
                    id: filepath
                }
                
                if(stats.isDirectory()) {
                    item.type = 'container';
                } else {
                    item.type = 'file';
                }
            }));
        });
    }
}

module.exports.plugin = function() {
    return {
        init: function(opts) {
            logger.trace("FilesChannel plugin initing.");
            opts.pith.registerChannel({
                name: 'files',
                type: 'channel',
                init: function(opts) {
                    return new FilesChannel(opts.pith);
                },
                sequence: 0
            });
        }
    }
};