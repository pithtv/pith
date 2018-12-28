const Global = require("./global")();
const md5 = require("MD5");
const fs = require("fs");
const sharp = require("sharp");
const fetch = require('node-fetch');
const mimetypes = require('./mimetypes');

const dbDir = Global.dataDir + "/thumbnails";

if(!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

function getThumbnail(url, size, extension, callback) {
    const dir = dbDir + "/" + size;
    const file = dir + "/" + md5(url) + "." + extension;
    const sizes = size.split(/x/).map(x => parseInt(x));

    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    
    fs.access(file, function(err) {
        if(err) {
            if(size == 'original') {
                fetch(url).then(response => {
                    if(response.status == 200) {
                        const stream = fs.createWriteStream(file);
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
                        sharp(origFile)
                            .resize(sizes[0], sizes[1])
                            .toFile(file)
                        .then(function(image) {
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
    const q = req.originalUrl.lastIndexOf('?'),
        size = req.originalUrl.substring(q).match(/[?&]size=([^&]*)/),
        format = req.originalUrl.substring(q).match(/[?&]format=([^&]*)/);
    let url = req.originalUrl.substring(0, q).replace(/.*\/scale\//, '');

    if(!url) {
        res.status(404);
        res.end();
        return;
    }
        
    if(!url.match(/^https?\:\/\//)) {
        url = Global.rootUrl + url;
    }

    const extension = format && format[1] || url.replace(/.*\.([^.?]{3,4})?.*/g, '$1') || "png";

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