import {DBDriver} from './DBDriver';
import {inject, injectable, singleton} from 'tsyringe';
import {SettingsStore} from '../settings/SettingsStore';
import {getLogger} from 'log4js';
import {MongoClient} from 'mongodb';
import {wrap} from '../lib/async';

const logger = getLogger("peristence.mongodb");

@injectable()
@singleton()
export class MongoDBDriver implements DBDriver {
    private database: any;
    constructor(@inject("SettingsStore") private settingsStore: SettingsStore) {
    }

    async open() {
        this.database = await wrap(cb => MongoClient.connect(this.settingsStore.settings.mongoUrl, cb));
    }

    collection(name: string) {
        if (!this.database) {
            throw new Error('Attempting to access database without opening first');
        }
        return this.database.collection(name);
    }
}
