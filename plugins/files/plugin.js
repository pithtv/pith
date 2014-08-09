var fs = require("fs");
var logger = require("console");

function FilesChannel(pith) {
    logger.trace("FilesChannel channel inited");
    this.rootDir = "/media/DATA/";
    this.pith = pith;
}

FilesChannel.prototype = {
    listContents: function(containerId, cb) {
        logger.trace("FilesChannel.listContents", containerId);
        var path = this.rootDir;
        var matchRootDir = new RegExp("^" + path);
        if(containerId != null) {
            path = path + containerId;
        }
        
        var filesChannel = this;
        
        fs.readdir(path, function(err, files) {
            if(err) {
                cb(null);
            } else {
                cb(files.map(function(file) {
                    var filepath = path + file;
                    var itemId = filepath.replace(matchRootDir, "");
                    return filesChannel.getItem(itemId);
                }));
            }
        });
    },
    
    getItem: function(itemId) {
        var stats = fs.statSync(this.rootDir + itemId);
        var item = {
            title: itemId.replace(/.*\//, ""),
            id: itemId,
            isLocal: function() { return true; }
        };

        if(stats.isDirectory()) {
            item.type = 'container';
        } else {
            item.type = 'file';
            item.playable = true;
        }

        return item;
    },
    
    getLocalFile: function(itemId, cb) {
        cb(this.rootDir + itemId);
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
    }
};