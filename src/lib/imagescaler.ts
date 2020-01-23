import global from './global';
import md5 from 'MD5';
import fs from 'fs';
import sharp from 'sharp';
import fetch from 'node-fetch';
import mimetypes from './mimetypes';

const Global = global();
const dbDir = Global.dataDir + "/thumbnails";

if(!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir);
}

export function getThumbnail(url, size, extension, callback) {
    const dir = dbDir + "/" + size;
    const file = dir + "/" + md5(url) + "." + extension;
    const sizes = size.split(/x/).map(x => parseInt(x));

    if(!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    fs.access(file, function(err) {
        if(err) {
            if(size === 'original') {
                fetch(url).then(response => {
                    if(response.status === 200) {
                        const stream = fs.createWriteStream(file);
                        response.body.pipe(stream);
                        stream.on('finish', function() {
                            stream.close();
                            callback(null, file);
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

export function handle(req, res) {
    const q = req.originalUrl.lastIndexOf('?'),
        size = req.originalUrl.substring(q).match(/[?&]size=([^&]*)/),
        format = req.originalUrl.substring(q).match(/[?&]format=([^&]*)/);
    let url = req.originalUrl.substring(0, q).replace(/.*\/scale\//, '');

    if(url.match(/^https?%3A%2F%2F/)) {
        url = decodeURIComponent(url);
    }

    if(!url) {
        res.status(404);
        res.end();
        return;
    }

    if(!url.match(/^https?:\/\//)) {
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
            res.header('Content-Type', mimetypes.fromFilePath(file));
            res.sendFile(file, {maxAge: 31536000});
        }
    });
}
