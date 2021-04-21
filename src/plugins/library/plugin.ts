import {Channel} from '../../lib/channel';
import {getLogger} from 'log4js';
import {Repository} from './database';
import {Pith} from '../../pith';
import moviesDirectory from './directory.movies';
import showsDirectory from './directory.shows';
import moviesScanner from './scanner.movie';
import showsScanner from './scanner.tvshow';
import {inject, injectable} from 'tsyringe';
import {SettingsStore, SettingsStoreSymbol} from '../../settings/SettingsStore';
import {DBDriver, DBDriverSymbol} from '../../persistence/DBDriver';
import {PithPlugin, plugin} from '../plugins';
import {DirectoryFactory, LibraryRoot} from "./types";
import {IChannel, IChannelItem, IMediaChannelItem, IPlayState} from "../../channel";
import {Ribbon, SharedRibbons} from "../../ribbon";

const logger = getLogger("pith.plugin.library");

class LibraryChannel extends Channel implements IChannel {
    private db: Repository;
    private directory: LibraryRoot[];

    constructor(private pithApp: Pith, dbDriver: DBDriver, directoryFactory: DirectoryFactory, private ribbons: Ribbon[]) {
        super();

        this.pithApp = pithApp;
        this.db = new Repository(dbDriver);

        this.directory = directoryFactory(this);
    }

    private listContentsWithoutPlayStates(containerId) : Promise<IChannelItem[]> {
        if(!containerId) {
            return Promise.resolve(this.directory.filter(function(d) {
                return d.visible !== false;
            }));
        } else {
            const i = containerId.indexOf('/');

            const directoryId = i > -1 ? containerId.substring(0, i) : containerId;

            const directory = this.directory.filter(function (e) {
                return e.id === directoryId;
            })[0];

            return directory._getContents(i > -1 ? containerId.substring(i + 1) : null);
        }
    }

    async listContents(path) {
        const contents = await this.listContentsWithoutPlayStates(path);
        return Promise.all(contents.map(item => {
            if(item.playState) {
                return item;
            } else {
                return this.getLastPlayStateFromItem(item).then(playState => {
                    item.playState = playState;
                    return item;
                })
            }
        }));
    }

    async getItem(itemId) : Promise<IChannelItem> {
        if(!itemId) {
            return { title: "Movies", id: null, type: "container" };
        } else {
            const i = itemId.indexOf('/');

            const directoryId = i > -1 ? itemId.substring(0, i) : itemId;

            const directory = this.directory.filter(function (e) {
                return e.id === directoryId;
            })[0];

            if(!directory) {
                throw Error("Not found");
            }

            if(directory._getItem) {
                return directory._getItem(i > -1 ? itemId.substring(i+1).replace(/\/$/,'') : null);
            } else {
                return {id: itemId, sortableFields: directory.sortableFields, type: directory.type, title: directory.title, description: directory.description};
            }
        }
    }

    async getStream(item, options) {
        const channel = this;
        const targetChannel = channel.pithApp.getChannelInstance(item.channelId);
        const targetItem = await targetChannel.getItem(item.originalId);
        return targetChannel.getStream(targetItem, options);
    }

    getLastPlayStateFromItem(item) {
        if(item && item.originalId) {
            const targetChannel = this.pithApp.getChannelInstance(item.channelId);
            return targetChannel.getLastPlayState(item.originalId);
        } else {
            return Promise.resolve(undefined);
        }
    }

    async getLastPlayState(itemId) : Promise<IPlayState>{
        const item = await this.getItem(itemId);
        return this.getLastPlayStateFromItem(item);
    }

    async putPlayState(itemId, state) {
        const item = await this.getItem(itemId);
        const targetChannel = this.pithApp.getChannelInstance(item.channelId);
        return targetChannel.putPlayState(item.originalId, state);
    }

    async getRibbons(): Promise<Ribbon[]> {
        return this.ribbons;
    }

    async listRibbonContents(ribbonId: string, maximum: number): Promise<IMediaChannelItem[]> {
        if(!this.ribbons.find(r => r.id === ribbonId)) {
            return [];
        }
        switch(ribbonId) {
            case SharedRibbons.recentlyAdded.id:
                return await this.listContents("recentlyadded") as IMediaChannelItem[];
            case SharedRibbons.recentlyReleased.id:
                return await this.listContents("recentlyreleased") as IMediaChannelItem[];
            default:
                return [];
        }
    }
}

@plugin()
@injectable()
export default class LibraryPlugin implements PithPlugin {

    scanners: any;
    private pith: Pith;

    constructor(@inject(SettingsStoreSymbol) private settingsStore: SettingsStore,
                @inject(DBDriverSymbol) private dbDriver: DBDriver) {}

    init(opts) {
        const self = this;
        const moviesChannel = new LibraryChannel(opts.pith, this.dbDriver, moviesDirectory, [SharedRibbons.recentlyReleased, SharedRibbons.recentlyAdded]);
        const showsChannel = new LibraryChannel(opts.pith, this.dbDriver, showsDirectory, [SharedRibbons.recentlyAdded]);

        this.pith = opts.pith;

        // set up scanners
        const scannerOpts = {
            db: new Repository(this.dbDriver)
        };
        this.scanners = {
            movies: moviesScanner(scannerOpts),
            tvshows: showsScanner(scannerOpts)
        };
        setTimeout(function() {
            self.scan(false);
        }, 10000);

        opts.pith.registerChannel({
            id: 'movies',
            title: 'Movies',
            init: function(opts) {
                return moviesChannel;
            },
            sequence: 2
        });

        opts.pith.registerChannel({
            id: 'shows',
            title: 'Shows',
            init: function(opts) {
                return showsChannel;
            }
        });
    }

    async scan(manual) {
        const plug = this;

        logger.info("Starting library scan");
        const scanStartTime = new Date().getTime();

        try {
            let scanningCandidates = this.settingsStore.settings.library.folders.filter(c => plug.scanners[c.contains] !== undefined && (c.scanAutomatically || manual === true));
            for (let dir of scanningCandidates) {
                const channelInstance = plug.pith.getChannelInstance(dir.channelId);
                if (channelInstance !== undefined) {
                    await plug.scanners[dir.contains].scan(channelInstance, dir);
                }
            }
        } catch(e) {
            logger.error("Scanning aborted due to error");
            logger.error(e);
        } finally {
            const scanEndTime = new Date().getTime();
            logger.info("Library scan complete. Took %d ms", (scanEndTime - scanStartTime));
            setTimeout(() => {
                plug.scan(false);
            }, this.settingsStore.settings.library.scanInterval);
        }
    }
};
