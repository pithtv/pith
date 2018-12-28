var Global = require("./global")();
var md5 = require("MD5");
var fs = require("fs");
var easyimg = require("easyimage");
var http = require('http');
var fetch = require('node-fetch');
var mimetypes = require('./mimetypes');

var dbDir = Global.dataDir + "/thumbnails";
if(!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

function getThumbnail(url, size, extension, callback) {
    var dir = dbDir + "/" + size;
    var file = dir + "/" + md5(url) + "." + extension;
    var sizes = size.split(/x/);
    
    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    
    fs.exists(file, function(fileExists) {
        if(!fileExists) {
            if(size == 'original') {
                fetch(url).then(response => {
                    if(response.status == 200) {
                        var stream = fs.createWriteStream(file);
                        response.body.pipe(stream);
                        stream.on('finish', function() {
                            stream.close(function() {
                                callback(null, file);
                            });
                        });
                    } else {
                        callback({notfound: true, message: "Unable to fetch image: status " + response.status});
                    }
                }).catch(callback);
            } else {
                getThumbnail(url, "original", extension, function(err, origFile) {
                    if(err) {
                        callback(err);
                    } else {
                        easyimg.resize({
                            src: origFile,
                            dst: file,
                            width: sizes[0],
                            height: sizes[1]
                        }).then(function(image) {
                            callback(null, file);
                        }, function(err) {
                            callback(err);
                        });
                    }
                });
            }
        } else {
            callback(null, file);
        }
    });
}

function handle(req, res) {
    var q = req.originalUrl.lastIndexOf('?'),
        size = req.originalUrl.substring(q).match(/[?&]size=([^&]*)/),
        format = req.originalUrl.substring(q).match(/[?&]format=([^&]*)/),
        url = req.originalUrl.substring(0, q).replace(/.*\/scale\//, '');
    
    if(!url) {
        res.status(404);
        res.end();
        return;
    }
        
    if(!url.match(/^https?\:\/\//)) {
        url = Global.rootUrl + url;
    }
    
    var extension = format && format[1] || url.replace(/.*\.([^.?]{3,4})?.*/g, '$1') || "png";
    
    getThumbnail(url, size && size[1], extension, function(err, file) {
        if(err) {
            if(err.notfound) {
                res.status(404);
                res.end();
            } else {
                res.status(500);
                res.json(err);
                res.end();
            }
        } else {
            let actualExtension = file.substr(file.lastIndexOf('.'));
            res.header('Content-Type', mimetypes[actualExtension]);
            res.sendFile(file, {maxAge: 31536000});
        }
    });
}

module.exports = {
    getThumbnail: getThumbnail,
    handle: handle
};