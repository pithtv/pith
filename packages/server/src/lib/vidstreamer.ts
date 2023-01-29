/* tslint:disable:no-bitwise */
/*!
* VidStreamer.js
*
* Original Source Copyright (c) 2012 Andrew Weeks http://meloncholy.com
* Licensed under the MIT licence. See http://meloncholy.com/licence
*/

import fs from 'fs';
import url from 'url';

import ff from 'fluent-ffmpeg';
import profiles from './profiles';
import path from 'path';
import {keyframes} from './keyframes';
import {getLogger} from 'log4js';
import mimeTypes from './mimetypes';
import {FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";
import {wrap} from "./async";

const logger = getLogger('pith.streamer');

interface Settings {
    server?: string,
    forceDownload?: boolean,
    maxAge?: number,
    resolver: (path: string) => Promise<string> | string
}

const defaultSettings = {
    server: 'Pith',
    forceDownload: false,
    maxAge: 3600
};

type VidStreamerQueryParams = {
    transcode: string,
    playlist: string,
    start: string,
    duration: string
};

function isNumber(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

export class VideoStreamer {
    private settings: Settings;
    constructor(options: Settings) {
        this.settings = {
            ...defaultSettings,
            ...options
        }
    }
    get plugin() : FastifyPluginAsync {
        return async (fastify, _) => {
            fastify.get<{
                Params: VidStreamerQueryParams
            }>('/:fingerprint/*', (req, res) => {
                this.handleRequest(req, res) // ignore promise result, because otherwise fastify will close the connection too soon
            })
        }
    }

    private async handleRequest(req: FastifyRequest<{Params: VidStreamerQueryParams}>, res: FastifyReply) {
        let stream;
        let stat;
        const info: StreamInfo = {};
        const rangeHeader = typeof req.headers.range === 'string' ? req.headers.range : undefined;
        const transcode = req.params.transcode;
        const generatePlaylist = req.params.playlist;
        const offset = req.params.start;
        const duration = req.params.duration;
        const reqUrl = url.parse(req.url, true);

        info.path = req.params["*"] // typeof reqUrl.pathname === 'string' ? reqUrl.pathname.substring(1) : undefined;

        // tslint:disable-next-line:only-arrow-functions
        const filePath = await this.settings.resolver(info.path)

        if (generatePlaylist === 'm3u8') {
            const metadata = await wrap(cb => ff.ffprobe(filePath, cb)) as any;
            function writePlayList(frames?) {
                function frame(frameDuration, frameOffset) {
                    return `#EXTINF:${frameDuration.toFixed(6)},\n` +
                        `${encodeURIComponent(path.basename(info.path))}?transcode=${transcode}&start=${frameOffset}&duration=${frameDuration}\n`;
                }

                const chunkSize = 10;
                let playlist = '#EXTM3U\n';
                playlist += '#EXT-X-PLAYLIST-TYPE:VOD\n';
                playlist += '#EXT-X-VERSION:3\n';
                playlist += '#EXT-X-MEDIA-SEQUENCE:0\n';
                playlist += '#EXT-X-ALLOW-CACHE:NO\n';
                playlist += `#EXT-X-TARGETDURATION:${chunkSize + 1}\n`;

                if (!frames) {
                    for (let x = 0; x < metadata.format.duration; x += 10) {
                        playlist += frame(Math.min(chunkSize, metadata.format.duration - x), x);
                    }
                } else {
                    let x;
                    let lastFrame = frames[0];

                    for (x = 1; x < frames.length - 1; x++) {
                        const fragmentDuration = (frames[x].timestamp - lastFrame.timestamp) / 1000;
                        if (fragmentDuration > chunkSize) {
                            playlist += frame(fragmentDuration, lastFrame.timestamp / 1000);
                            lastFrame = frames[x];
                        }
                    }
                    playlist += frame(metadata.format.duration - lastFrame.timestamp / 1000, lastFrame.timestamp / 1000);
                }

                playlist += '#EXT-X-ENDLIST\n';
                res.header('Content-Type', mimeTypes['.m3u8']);
                res.send(playlist);
            }

            keyframes(filePath, metadata).then(frames => writePlayList(frames)).catch(() => writePlayList());
        } else if (transcode) {
            const metadata = wrap(cb => ff.ffprobe(filePath, cb));
            const preset = profiles[transcode];
            const decoder = ff(filePath);

            if (offset) {
                decoder.seekInput(offset);
            }

            if (duration) {
                decoder.duration(duration);
            }

            const str = preset.setup(decoder, metadata);

            res.code(200)
            res.header('content-type', preset.mimetype)
            res.send(str)
        } else {
            try {
                stat = await fs.promises.stat(filePath);

                if (!stat.isFile()) {
                    this.badFile(res)
                    return false;
                }
            } catch (e) {
                this.badFile(res, e)
                return false;
            }

            info.start = 0;
            info.end = stat.size - 1;
            info.size = stat.size;
            info.modified = stat.mtime;
            info.rangeRequest = false;
            info.file = path.basename(filePath);
            info.mime = mimeTypes.fromFilePath(filePath);

            // tslint:disable-next-line:no-conditional-assignment
            const range = rangeHeader?.match(/bytes=(.+)-(.+)?/).map(parseInt)
            if (range) {
                // Check range contains numbers, and they fit in the file.
                // Make sure info.start & info.end are numbers (not strings) or stream.pipe errors out if start > 0.
                info.start = isNumber(range[1]) && range[1] >= 0 && range[1] < info.end ? range[1] : info.start;
                info.end = isNumber(range[2]) && range[2] > info.start && range[2] <= info.end ? range[2] : info.end;
                info.rangeRequest = true;
            } else if (reqUrl.query.start || reqUrl.query.end) {
                const start = parseFloat(reqUrl.query.start as string);
                const end = parseFloat(reqUrl.query.end as string);
                // This is a range request, but doesn't get range headers. So there.
                info.start = isNumber(start) && start >= 0 && start < info.end ? start : info.start;
                info.end = isNumber(end) && end > info.start && end <= info.end ? end : info.end;
            }

            info.length = info.end - info.start + 1;

            this.downloadHeader(res, info);

            if (req.method === 'GET') {
                // Flash vids seem to need this on the front, even if they start part way through. (JW Player does anyway.)
                if (info.start > 0 && info.mime === 'video/x-flv') {
                    res.send('FLV' + this.pack('CCNN', 1, 5, 9, 9));
                }
                stream = fs.createReadStream(filePath, {flags: 'r', start: info.start, end: info.end})
                res.send(stream)
            } else {
                res.send("");
            }
        }
    }

    downloadHeader(res: FastifyReply, info: StreamInfo) {
        let code = 200;
        let header;

        if (this.settings.forceDownload) {
            header = {
                Expires: 0,
                'Cache-Control': 'must-revalidate, post-check=0, pre-check=0',
                // "Cache-Control": "private",
                "Content-Type": info.mime || 'application/octet-stream',
                "Content-Disposition": `attachment; filename=${encodeURIComponent(info.file)};`
            };
        } else {
            header = {
                "Cache-Control": "public; max-age=" + (this.settings.maxAge || 3600),
                Connection: "keep-alive",
                "Content-Type": info.mime || 'application/octet-stream',
                "Content-Disposition": `inline; filename=${encodeURIComponent(info.file)};`
            };

            if (info.rangeRequest) {
                // Partial http response
                code = 206;
                header.Status = '206 Partial Content';
                header['Accept-Ranges'] = 'bytes';
                header['Content-Range'] = 'bytes ' + info.start + '-' + info.end + '/' + info.size;
            }
        }

        header.Pragma = 'public';
        header['Last-Modified'] = info.modified.toUTCString();
        header['Content-Transfer-Encoding'] = 'binary';
        header['Content-Length'] = info.length;
        if (this.settings.server) {
            header.Server = this.settings.server;
        }
        header['transferMode.dlna.org'] = 'Streaming';
        header['realTimeInfo.dlna.org'] = 'DLNA.ORG_TLAG=*';

        res.code(code)
        res.headers(header)
    }

    errorHeader(res: FastifyReply, code: number) {
        const header = {
            'Content-Type': 'text/html',
            Server: this.settings.server
        };

        res.code(code)
        res.headers(header)
    };

// A tiny subset of http://phpjs.org/functions/pack:880
    pack(format, ...args) {
        let result = '';

        let pos = 1;
        const len = arguments.length;
        for (; pos < len; pos++) {
            if (format[pos - 1] === 'N') {
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

    private badFile(res: FastifyReply, e?: Error) {
        this.errorHeader(res, 404);
        res.send('<!DOCTYPE html><html lang="en">' +
            '<head><title>404 Not found</title></head>' +
            '<body>' +
            '<h1>Ooh dear</h1>' +
            '<p>Sorry, I can\'t find that file. Could you check again?</p>' +
            '</body></html>');
        logger.error('404 Bad File - ' + (e?.message ?? ''));
    }
}

interface StreamInfo {
    length?: number;
    mime?: string;
    file?: string;
    rangeRequest?: boolean;
    modified?: Date;
    size?: number;
    end?: number;
    start?: number;
    path?: string;
}
