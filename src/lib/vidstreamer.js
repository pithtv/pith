/*!
* VidStreamer.js
*
* Original Source Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* Licensed under the MIT licence. See http://meloncholy.com/licence
*/

"use strict";

const fs = require("fs");
const url = require("url");
const events = require("events");
const ff = require("fluent-ffmpeg");
const profiles = require("./profiles");
const settings = {server: "Pith"};
const path = require("path");
const keyframes = require('./keyframes');

const handler = new events.EventEmitter();

const logger = require("log4js").getLogger("pith.streamer");

// Stuff to serve. Don't add null or "null" to the list (".null" should be fine) as the regex extension check will fail and you'll have a big security hole. And obviously don't add .js, .php or anything else you don't want to serve as source either.
const mimeTypes = require("./mimetypes");

const vidStreamer = function (req, res) {
    let stream;
    let stat;
    const info = {};
    let range = typeof req.headers.range === "string" ? req.headers.range : undefined;
    const transcode = req.params.transcode;
    const generatePlaylist = req.params.playlist;
    const offset = req.params.start;
    const duration = req.params.duration;
    const reqUrl = url.parse(req.url, true);

    info.path = typeof reqUrl.pathname === "string" ? reqUrl.pathname.substring(1) : undefined;

    if (info.path) {
        try {
            info.path = decodeURIComponent(info.path);
        } catch (exception) {
            // Can throw URI malformed exception.
            handler.emit("badRequest", res);
            return false;
        }
    }

    settings.getFile(info.path, function (filePath) {
        if (generatePlaylist === "m3u8") {
            ff.ffprobe(filePath, (err, metadata) => {
                function writePlayList(frames) {
                    function frame(duration, offset) {
                        return `#EXTINF:${duration.toFixed(6)},\n` +
                            `${encodeURIComponent(path.basename(info.path))}?transcode=${transcode}&start=${offset}&duration=${duration}\n`;
                    }

                    if (err) {
                        handler.emit("badFile", res, err);
                    } else {
                        let chunkSize = 10;
                        let playlist = "#EXTM3U\n";
                        playlist += "#EXT-X-PLAYLIST-TYPE:VOD\n";
                        playlist += "#EXT-X-VERSION:3\n";
                        playlist += "#EXT-X-MEDIA-SEQUENCE:0\n";
                        playlist += "#EXT-X-ALLOW-CACHE:NO\n";
                        playlist += `#EXT-X-TARGETDURATION:${chunkSize + 1}\n`;

                        if (!frames) {
                            for (let x = 0; x < metadata.format.duration; x += 10) {
                                let duration = Math.min(chunkSize, metadata.format.duration - x);
                                playlist += frame(duration, x);
                            }
                        } else {
                            let x, lastFrame = frames[0];

                            for (x = 1; x < frames.length - 1; x++) {
                                let duration = (frames[x].timestamp - lastFrame.timestamp) / 1000;
                                if (duration > chunkSize) {
                                    playlist += frame(duration, lastFrame.timestamp / 1000);
                                    lastFrame = frames[x];
                                }
                            }
                            playlist += frame(metadata.format.duration - lastFrame.timestamp / 1000, lastFrame.timestamp / 1000);
                        }

                        playlist += "#EXT-X-ENDLIST\n";
                        res.header("Content-Type", mimeTypes[".m3u8"]);
                        res.send(playlist);
                    }
                }

                keyframes(filePath, metadata).then(frames => writePlayList(frames)).catch(() => writePlayList());
            });
        } else if (transcode) {
            ff.ffprobe(filePath, (err, metadata) => {
                let preset = profiles[transcode];
                let stream = ff(filePath);

                if (offset) {
                    stream.seekInput(offset);
                }

                if (duration) {
                    stream.duration(duration);
                }

                stream = preset.setup(stream, metadata);

                res.writeHead(200, {
                    "content-type": preset.mimetype
                });

                stream.pipe(res);
            });
        } else {
            try {
                stat = fs.statSync(filePath);

                if (!stat.isFile()) {
                    handler.emit("badFile", res);
                    return false;
                }
            } catch (e) {
                handler.emit("badFile", res, e);
                return false;
            }

            info.start = 0;
            info.end = stat.size - 1;
            info.size = stat.size;
            info.modified = stat.mtime;
            info.rangeRequest = false;
            info.file = path.basename(filePath);
            info.mime = mimeTypes.fromFilePath(filePath);

            if (range !== undefined && (range = range.match(/bytes=(.+)-(.+)?/)) !== null) {
                // Check range contains numbers and they fit in the file.
                // Make sure info.start & info.end are numbers (not strings) or stream.pipe errors out if start > 0.
                info.start = isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1] - 0 : info.start;
                info.end = isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] - 0 : info.end;
                info.rangeRequest = true;
            } else if (reqUrl.query.start || reqUrl.query.end) {
                // This is a range request, but doesn't get range headers. So there.
                info.start = isNumber(reqUrl.query.start) && reqUrl.query.start >= 0 && reqUrl.query.start < info.end ? reqUrl.query.start - 0 : info.start;
                info.end = isNumber(reqUrl.query.end) && reqUrl.query.end > info.start && reqUrl.query.end <= info.end ? reqUrl.query.end - 0 : info.end;
            }

            info.length = info.end - info.start + 1;

            downloadHeader(res, info);

            if (req.method === 'GET') {
                // Flash vids seem to need this on the front, even if they start part way through. (JW Player does anyway.)
                if (info.start > 0 && info.mime === "video/x-flv") {
                    res.write("FLV" + pack("CCNN", 1, 5, 9, 9));
                }
                stream = fs.createReadStream(filePath, {flags: "r", start: info.start, end: info.end});
                stream.pipe(res);
            } else {
                res.end();
            }
        }
    });
};

vidStreamer.settings = function (s) {
    Object.assign(settings, s);
    return vidStreamer;
};

function downloadHeader(res, info, metadata) {
    let code = 200;
    let header;

    // 'Connection':'close',
    // 'Cache-Control':'private',
    // 'Transfer-Encoding':'chunked'

    if (settings.forceDownload) {
        header = {
            Expires: 0,
            "Cache-Control": "must-revalidate, post-check=0, pre-check=0",
            //"Cache-Control": "private",
            "Content-Type": info.mime || 'application/octet-stream',
            "Content-Disposition": `attachment; filename=${encodeURIComponent(info.file)};`
        };
    } else {
        header = {
            "Cache-Control": "public; max-age=" + (settings.maxAge || 3600),
            Connection: "keep-alive",
            "Content-Type": info.mime || 'application/octet-stream',
            "Content-Disposition": `inline; filename=${encodeURIComponent(info.file)};`
        };

        if (info.rangeRequest) {
            // Partial http response
            code = 206;
            header.Status = "206 Partial Content";
            header["Accept-Ranges"] = "bytes";
            header["Content-Range"] = "bytes " + info.start + "-" + info.end + "/" + info.size;
        }
    }

    header.Pragma = "public";
    header["Last-Modified"] = info.modified.toUTCString();
    header["Content-Transfer-Encoding"] = "binary";
    header["Content-Length"] = info.length;
    if (settings.server) header.Server = settings.server;
    header["transferMode.dlna.org"] = "Streaming";
    header["realTimeInfo.dlna.org"] = "DLNA.ORG_TLAG=*";

    res.writeHead(code, header);
};

const errorHeader = function (res, code) {
    const header = {
        "Content-Type": "text/html",
        Server: settings.server
    };

    res.writeHead(code, header);
};

// http://stackoverflow.com/a/1830844/648802
function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

// A tiny subset of http://phpjs.org/functions/pack:880
function pack(format) {
    let result = "";

    let pos = 1;
    const len = arguments.length;
    for (; pos < len; pos++) {
        if (format[pos - 1] === "N") {
            result += String.fromCharCode(arguments[pos] >> 24 & 0xFF);
            result += String.fromCharCode(arguments[pos] >> 16 & 0xFF);
            result += String.fromCharCode(arguments[pos] >> 8 & 0xFF);
            result += String.fromCharCode(arguments[pos] & 0xFF);
        } else {
            result += String.fromCharCode(arguments[pos]);
        }
    }

    return result;
}

handler.on("badFile", function (res, e) {
    errorHeader(res, 404);
    res.end("<!DOCTYPE html><html lang=\"en\">" +
        "<head><title>404 Not found</title></head>" +
        "<body>" +
        "<h1>Ooh dear</h1>" +
        "<p>Sorry, I can't find that file. Could you check again?</p>" +
        "</body></html>");
    logger.error("404 Bad File - " + (e ? e.message : ""));
});

handler.on("badRange", function (res, e) {
    errorHeader(res, 416);
    res.end("<!DOCTYPE html><html lang=\"en\">" +
        "<head><title>416 Range not satisifiable</title></head>" +
        "<body>" +
        "<h1>Ooh dear</h1>" +
        "<p>Sorry, the file isn't that big. Maybe try asking for a bit before the end of the file?</p>" +
        "</body></html>");
    logger.error("416 Bad Range - " + (e ? e.message : ""));
});

handler.on("security", function (res, e) {
    errorHeader(res, 403);
    res.end("<!DOCTYPE html><html lang=\"en\">" +
        "<head><title>403 Forbidden</title></head>" +
        "<body>" +
        "<h1>Hey!</h1>" +
        "<p>Stop trying to hack my server!</p>" +
        "</body></html>");
    logger.error("403 Security - " + (e ? e.message : ""));
});

handler.on("badMime", function (res, e) {
    errorHeader(res, 403);
    res.end("<!DOCTYPE html><html lang=\"en\">" +
        "<head><title>403 Forbidden</title></head>" +
        "<body>" +
        "<h1>Sorry&hellip;</h1>" +
        "<p>You're not allowed to download files of that type.</p>" +
        "</body></html>");
    logger.error("403 Bad MIME - " + (e ? e.message : ""));
});

handler.on("badRequest", function (res, e) {
    errorHeader(res, 400);
    res.end("<!DOCTYPE html><html lang=\"en\">" +
        "<head><title>400 Bad request</title></head>" +
        "<body>" +
        "<h1>Wut?</h1>" +
        "<p>I couldn't understand that I'm afraid; the syntax appears malformed.</p>" +
        "</body></html>");
    logger.error("400 Bad Request - " + (e ? e.message : ""));
});

handler.on("noRandomFiles", function (res, e) {
    errorHeader(res, 404);
    res.end("<!DOCTYPE html><html lang=\"en\">" +
        "<head><title>404 Not found</title></head>" +
        "<body>" +
        "<h1>Sorry&hellip;</h1>" +
        "<p>There don't appear to be any files of that type at all there.</p>" +
        "</body></html>");
    logger.error("404 No Random Files - " + (e ? e.message : ""));
});

/*process.on('uncaughtException', function(e) {
	util.debug(e);
});*/

module.exports = vidStreamer;
