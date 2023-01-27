import 'reflect-metadata';
import {Bootstrap} from "./bootstrap";
import {ImageScaler} from './lib/imagescaler';
import {DBDriverSymbol} from './persistence/DBDriver';
import {FileSettingsStore} from './settings/FileSettingsStore';
import {container} from 'tsyringe';
import {SettingsStoreSymbol} from './settings/SettingsStore';
import {SwitchingDBDriver} from "./persistence/SwitchingDBDriver";
import log4js from 'log4js';

require('source-map-support').install();

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

const fileSettingsStore = new FileSettingsStore();
container.registerInstance(SettingsStoreSymbol, fileSettingsStore);
container.registerInstance(DBDriverSymbol, container.resolve(SwitchingDBDriver));
container.registerSingleton(ImageScaler);

(async function start() {
    await fileSettingsStore.load();
    container.resolve(Bootstrap).startup();
})();
