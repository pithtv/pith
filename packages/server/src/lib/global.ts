import {inject, injectable, singleton} from 'tsyringe';
import {SettingsStore, SettingsStoreSymbol} from '../settings/SettingsStore';
import {getDefaultServerAddress} from './network';

@singleton()
@injectable()
export class Global {
    public readonly bindAddress: any;
    public readonly httpPort: number;
    public readonly rootUrl: string;

    constructor(@inject(SettingsStoreSymbol) private settingsStore: SettingsStore) {
        const loadedSettings = settingsStore.settings;

        this.bindAddress = loadedSettings.bindAddress || getDefaultServerAddress().IPv4;
        this.httpPort = parseInt(process.env.PORT, 10) || loadedSettings.httpPort;
        this.rootUrl = `http://${this.bindAddress}:${this.httpPort}`;
    }
}
