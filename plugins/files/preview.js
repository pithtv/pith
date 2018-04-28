var AVConv = require("../../lib/libav").AVConv;
var url = require("url");

function preview(getFile) {
    let queue = [];
    let currentlyRunning = false;

    function next() {
        if(queue.length) {
            console.log("Starting next preview extraction")
            queue.pop()();
            currentlyRunning = true;
        } else {
            currentlyRunning = false;
        }
    }

    return function(req, res) {
        queue.push(() => {
            let reqUrl = url.parse(req.url);
            let fullpath = decodeURIComponent(reqUrl.pathname.substring(1));
            let path = fullpath.substring(0, fullpath.lastIndexOf("/"));
            let seek = fullpath.substring(fullpath.lastIndexOf("/") + 1);
            seek = seek.substring(0, seek.length - 4);
            let file = getFile(path);

            let av = new AVConv(file);
            res.writeHead(200, {
                'content-type': 'image/jpeg'
            });
            let stream = av.seekInput(seek).inputOptions(["-noaccurate_seek"]).vframes(1).noAudio().format("mjpeg").videoCodec("mjpeg").stream();
            stream.pipe(res);
            stream.on('end', next);
        });

        if(!currentlyRunning) next();
    }
}

module.exports = preview;