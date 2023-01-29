import {StateStore} from './playstate';
import {SettingsStore, SettingsStoreSymbol} from '../../settings/SettingsStore';
import {inject, injectable} from 'tsyringe';
import {DBDriver, DBDriverSymbol} from '../../persistence/DBDriver';
import {PithPlugin, plugin} from '../plugins';
import {FilesChannel} from "./FilesChannel";
import {FastifyInstance} from "fastify";
import {Pith} from "../../pith";

@injectable()
@plugin()
export default class FilesPlugin implements PithPlugin {
    constructor(@inject(SettingsStoreSymbol) private settingsStore: SettingsStore,
                @inject(DBDriverSymbol) private dbDriver: DBDriver,
                @inject(StateStore) private stateStore: StateStore) {
    }

    async init({pith, fastify}: { pith: Pith, fastify: FastifyInstance}) {
        await this.stateStore.init();

        const channel = new FilesChannel(pith, this.stateStore, this.settingsStore)

        pith.registerChannel({
            id: 'files',
            title: 'Files',
            init: () => {
                return channel;
            },
            sequence: 0
        });

        fastify.register(channel.fastify(), {prefix: "/files"})
    }
}
