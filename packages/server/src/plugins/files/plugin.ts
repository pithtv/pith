import {StateStore} from './playstate';
import {SettingsStore, SettingsStoreSymbol} from '../../settings/SettingsStore';
import {inject, injectable} from 'tsyringe';
import {DBDriver, DBDriverSymbol} from '../../persistence/DBDriver';
import {PithPlugin, plugin} from '../plugins';
import {FilesChannel} from "./FilesChannel";

@injectable()
@plugin()
export default class FilesPlugin implements PithPlugin {
    constructor(@inject(SettingsStoreSymbol) private settingsStore: SettingsStore,
                @inject(DBDriverSymbol) private dbDriver: DBDriver,
                @inject(StateStore) private stateStore: StateStore) {
    }

    async init(opts) {
        await this.stateStore.init();
        opts.pith.registerChannel({
            id: 'files',
            title: 'Files',
            init: () => {
                return new FilesChannel(opts.pith, this.stateStore, this.settingsStore);
            },
            sequence: 0
        });
    }
}
