import {DBDriver} from './DBDriver';
import {inject, injectable, singleton} from 'tsyringe';
import {SettingsStore} from '../settings/SettingsStore';
import {getLogger} from 'log4js';
import {Collection, Db, MongoClient} from 'mongodb';

const logger = getLogger("peristence.mongodb");

@injectable()
@singleton()
export class MongoDBDriver implements DBDriver {
    private database: Db;
    constructor(@inject("SettingsStore") private settingsStore: SettingsStore) {
    }

    async open() {
        const fullUrl = this.settingsStore.settings.mongoUrl;
        const i = fullUrl.lastIndexOf('/');
        const serverUrl = fullUrl.substr(0, i);
        const databaseName = fullUrl.substr(i+1);

        const client = await new MongoClient(serverUrl).connect();
        this.database = client.db(databaseName);
    }

    collection(name: string) : Collection {
        if (!this.database) {
            throw new Error('Attempting to access database without opening first');
        }
        return this.database.collection(name);
    }
}
