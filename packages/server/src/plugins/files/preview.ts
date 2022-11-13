import {AVConv} from '../../lib/libav';
import url from 'url';

export function preview(getFile) {
    const queue = [];
    let currentlyRunning = false;

    function next() {
        if(queue.length) {
            queue.pop()();
            currentlyRunning = true;
        } else {
            currentlyRunning = false;
        }
    }

    return function(req, res) {
        queue.push(() => {
            const reqUrl = url.parse(req.url);
            const fullpath = decodeURIComponent(reqUrl.pathname.substring(1));
            const path = fullpath.substring(0, fullpath.lastIndexOf("/"));
            let seek = fullpath.substring(fullpath.lastIndexOf("/") + 1);
            seek = seek.substring(0, seek.length - 4);
            const file = getFile(path);

            const av = new AVConv(file);
            res.writeHead(200, {
                'content-type': 'image/jpeg'
            });
            const stream = av.seekInput(seek).inputOptions(["-noaccurate_seek"]).vframes(1).noAudio().format("mjpeg").videoCodec("mjpeg").stream();
            stream.pipe(res);
            stream.on('end', next);
        });

        if(!currentlyRunning) next();
    }
}
