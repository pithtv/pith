require('source-map-support').install();
import 'reflect-metadata';
import {ImageScaler} from './lib/imagescaler';
import {DBDriver, DBDriverSymbol} from './persistence/DBDriver';
import {FileSettingsStore} from './settings/FileSettingsStore';
import {container, inject, injectable} from 'tsyringe';
import {SettingsStore, SettingsStoreSymbol} from './settings/SettingsStore';
import {SwitchingDBDriver} from "./persistence/SwitchingDBDriver";
import {Global} from './lib/global';
import {Pith} from './pith';
import {handle as rest} from './lib/pithrest';
import express from 'express';
import http from 'http';
import ws from 'ws';
import bodyparser from 'body-parser';
import path from 'path';
import log4js from 'log4js';

const logger = log4js.getLogger('pith');

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'trace'
        }
    }
});

process.on('uncaughtException', (err) => {
    // handle the error safely
    logger.error(err);
});

// workaround
Object.defineProperty(http.IncomingMessage.prototype, 'upgrade', {
    get() {
        return 'connection' in this.headers && 'upgrade' in this.headers && this.headers.connection.startsWith('Upgrade') && this.headers.upgrade.toLowerCase() === 'websocket';
    },
    // tslint:disable-next-line:no-empty
    set(v) {
    }
});

const fileSettingsStore = new FileSettingsStore();
container.registerInstance(SettingsStoreSymbol, fileSettingsStore);
container.registerInstance(DBDriverSymbol, container.resolve(SwitchingDBDriver));
container.registerSingleton(ImageScaler);

@injectable()
class Bootstrap {
    constructor(
        @inject(SettingsStoreSymbol) private settingsStore: SettingsStore,
        @inject(DBDriverSymbol) private dbDriver: DBDriver,
        @inject(ImageScaler) private imageScaler: ImageScaler,
        @inject(Global) private global: Global) {
    }

    async startup() {
        await this.settingsStore.load();

        await this.dbDriver.open();

        const serverAddress = this.global.bindAddress;
        const port = this.global.httpPort;
        const pithPath = this.settingsStore.settings.pithContext;

        logger.info('Listening on http://' + serverAddress + ':' + port);

        const app = express();

        const pithApp = new Pith({
            rootUrl: this.global.rootUrl + '/pith/',
            rootPath: pithPath,
            express: app
        });

        pithApp.load();

        app.use(bodyparser.json());

        app.set('x-powered-by', false);

        app.use(pithPath, pithApp.handle);
        app.use(this.settingsStore.settings.apiContext, rest(pithApp));
        app.use('/icons', express.static(path.resolve(__dirname, '..', 'icons')));
        app.use('/scale', this.imageScaler.router);

        // exclude all private members in JSON messages (those starting with underscore)
        function jsonReplacer(k, v) {
            if (k.charAt(0) === '_') {
                return undefined;
            } else {
                return v;
            }
        }

        app.set('json replacer', jsonReplacer);

        const server = new http.Server(app);

        server.listen(port);
        // server.listen(port);

        const wss = new ws.Server({server: server});

        wss.on('connection', connection => {
            const listeners = [];
            connection.on('message', data => {
                try {
                    const message = JSON.parse(data.toString());
                    switch (message.action) {
                        case 'on':
                            const listener = (...args) => {
                                try {
                                    connection.send(JSON.stringify({
                                        event: message.event,
                                        arguments: args
                                    }, jsonReplacer));
                                } catch (e) {
                                    logger.error(e);
                                }
                            };
                            listeners.push({event: message.event, listener: listener});
                            pithApp.on(message.event, listener);
                            break;
                    }
                } catch (e) {
                    logger.error('Error processing event message', data, e);
                }
            });
            connection.on('close', () => {
                logger.debug('Client disconnected, cleaning up listeners');
                listeners.forEach((e) => {
                    pithApp.removeListener(e.event, e.listener);
                });
            });
        });
    }
}

(async function start() {
    await fileSettingsStore.load();
    container.resolve(Bootstrap).startup();
})();
