import md5 from 'MD5';
import fs from 'fs';
import sharp from 'sharp';
import fetch from 'node-fetch';
import mimetypes from './mimetypes';
import {inject, injectable} from 'tsyringe';
import {SettingsStore, SettingsStoreSymbol} from '../settings/SettingsStore';
import * as path from "path";
import {Global} from "./global";
import {FastifyPluginAsync, FastifyReply, FastifyRequest} from "fastify";

@injectable()
export class ImageScaler {
    private readonly dbDir: string;

    constructor(@inject(SettingsStoreSymbol) settingsStore: SettingsStore, @inject(Global) private global: Global) {
        this.dbDir = path.resolve(settingsStore.datadir, "thumbnails");

        if (!fs.existsSync(this.dbDir)) {
            fs.mkdirSync(this.dbDir, {recursive: true});
        }
    }

    get route() : FastifyPluginAsync {
        return (app, _) => {
            app.get('/*', (req, rep) => this.handle(req, rep))
            return Promise.resolve()
        }
    }

    async getThumbnail(url, size, extension) {
        const dir = this.dbDir + "/" + size;
        const file = dir + "/" + md5(url) + "." + extension;
        const sizes = size.split(/x/).map(x => parseInt(x));

        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir);
        }

        try {
            await fs.promises.access(file);
            return file;
        } catch (err) {
            if (size === 'original') {
                const response = await fetch(url);
                if (response.status === 200) {
                    const stream = fs.createWriteStream(file);
                    await new Promise((resolve, reject) => {
                        response.body.pipe(stream);
                        stream.on('finish', function () {
                            stream.close();
                            resolve(undefined);
                        });
                    });
                    return file;
                } else {
                    throw {notfound: true, message: "Unable to fetch image: status " + response.status};
                }
            } else {
                const origFile = await this.getThumbnail(url, "original", extension);
                await sharp(origFile)
                    .resize(sizes[0], sizes[1])
                    .toFile(file);
                return file;
            }
        }
    }

    async handle(req: FastifyRequest, res: FastifyReply) {
        const originalUrl = req.raw.url
        const q = originalUrl.lastIndexOf('?')
        const size = originalUrl.substring(q).match(/[?&]size=([^&]*)/)
        const format = originalUrl.substring(q).match(/[?&]format=([^&]*)/)
        let url = originalUrl.substring(0, q).replace(/.*\/scale\//, '')

        if (url.match(/^https?%3A%2F%2F/)) {
            url = decodeURIComponent(url)
        }

        if (!url) {
            res.status(404)
            return
        }

        if (!url.match(/^https?:\/\//)) {
            url = this.global.rootUrl + '/' + url
        }

        const extension = format && format[1] || url.replace(/.*\.([^.?]{3,4})?.*/g, '$1') || "png";

        try {
            const file = await this.getThumbnail(url, size && size[1], extension)
            res.header('Content-Type', mimetypes.fromFilePath(file));
            res.send(await fs.promises.readFile(file)) //, {maxAge: 31536000})
        } catch(err) {
            if (err.notfound) {
                res.status(404)
            } else {
                res.status(500)
                res.send(err)
            }
        }
    }
}


