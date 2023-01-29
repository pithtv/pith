import {AVConv} from '../../lib/libav';
import url from 'url';
import {FastifyReply, FastifyRequest} from "fastify";

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

    return (req: FastifyRequest, res: FastifyReply) => {
        queue.push(() => {
            const fullpath = req.params['*']
            const path = fullpath.substring(0, fullpath.lastIndexOf("/"));
            let seek = fullpath.substring(fullpath.lastIndexOf("/") + 1);
            seek = seek.substring(0, seek.length - 4);
            const file = getFile(path);

            const av = new AVConv(file);
            res.code(200)
            res.headers({
                'content-type': 'image/jpeg'
            });
            const stream = av.seekInput(seek).inputOptions(["-noaccurate_seek"]).vframes(1).noAudio().format("mjpeg").videoCodec("mjpeg").stream();
            res.send(stream)
            stream.on('end', next);
            stream.on('error', next);
        });

        if(!currentlyRunning) next();
    }
}
