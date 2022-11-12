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
import {Directory, DirectoryFactory} from "./types";
import {IChannel} from "../../channel";
import {IChannelItem, IContainerChannelItem, IMediaChannelItem, IPlayState, Ribbon} from "@pithmediaserver/api";
import {type} from "os";

const logger = getLogger("pith.plugin.library");

type LibraryEnhanced<T extends IChannelItem> = IChannelItem & { channelId: string, originalId: string }

class LibraryChannel extends Channel implements IChannel {
    private db: Repository;
    private directory: Directory;

    constructor(private pithApp: Pith, dbDriver: DBDriver, directoryFactory: DirectoryFactory) {
        super();

        this.pithApp = pithApp;
        this.db = new Repository(dbDriver);

        this.directory = directoryFactory(this);
    }

    private listContentsWithoutPlayStates(containerId): Promise<(LibraryEnhanced<IChannelItem>|IChannelItem)[]> {
        if (!containerId) {
            return Promise.resolve(this.directory.directories.filter(d => d.visible !== false));
        } else {
            const i = containerId.indexOf('/');

            const directoryId = i > -1 ? containerId.substring(0, i) : containerId;

            const directory = this.directory.directories.find(e => e.id === directoryId);

            return directory._getContents(i > -1 ? containerId.substring(i + 1) : null);
        }
    }

    async listContents(path) {
        const contents = await this.listContentsWithoutPlayStates(path) as LibraryEnhanced<IChannelItem>[];
        return Promise.all(contents.map(item => {
            if (item.playState) {
                return item;
            } else {
                return this.getLastPlayStateFromItem(item).then(playState => {
                    item.playState = playState;
                    return item;
                });
            }
        }));
    }

    async getItem(itemId): Promise<LibraryEnhanced<IChannelItem> | IChannelItem> {
        if (!itemId) {
            return {title: "Movies", id: null, type: "container"};
        } else {
            const i = itemId.indexOf('/');

            const directoryId = i > -1 ? itemId.substring(0, i) : itemId;

            const directory = this.directory.directories.find(e => e.id === directoryId);

            if (!directory) {
                throw Error("Not found");
            }

            if (directory._getItem) {
                return directory._getItem(i > -1 ? itemId.substring(i + 1).replace(/\/$/, '') : null);
            } else {
                return {
                    id: itemId,
                    sortableFields: directory.sortableFields,
                    type: directory.type,
                    title: directory.title,
                    description: directory.description
                } as IContainerChannelItem;
            }
        }
    }

    async getStream(item: LibraryEnhanced<IChannelItem>, options) {
        const channel = this;
        const targetChannel = channel.pithApp.getChannelInstance(item.channelId);
        const targetItem = await targetChannel.getItem(item.originalId);
        return targetChannel.getStream(targetItem, options);
    }

    getLastPlayStateFromItem(item: LibraryEnhanced<IChannelItem>) {
        if (item && item.originalId) {
            const targetChannel = this.pithApp.getChannelInstance(item.channelId);
            return targetChannel.getLastPlayState(item.originalId);
        } else {
            return Promise.resolve(undefined);
        }
    }

    async getLastPlayState(itemId): Promise<IPlayState> {
        const item = await this.getItem(itemId) as LibraryEnhanced<IChannelItem>;
        return this.getLastPlayStateFromItem(item);
    }

    async putPlayState(itemId, state) {
        const item = await this.getItem(itemId) as LibraryEnhanced<IChannelItem>;
        const targetChannel = this.pithApp.getChannelInstance(item.channelId);
        return targetChannel.putPlayState(item.originalId, state);
    }

    async getRibbons(): Promise<Ribbon[]> {
        return this.directory.ribbons.map(r => r.ribbon);
    }

    async listRibbonContents(ribbonId: string, maximum: number): Promise<IMediaChannelItem[]> {
        const ribbon = this.directory.ribbons.find(r => r.ribbon.id === ribbonId);
        if (ribbon) {
            return ribbon.getContents(maximum);
        }
    }
}

@plugin()
@injectable()
export default class LibraryPlugin implements PithPlugin {

    scanners: any;
    private pith: Pith;

    constructor(@inject(SettingsStoreSymbol) private settingsStore: SettingsStore,
                @inject(DBDriverSymbol) private dbDriver: DBDriver) {
    }

    init(opts) {
        const self = this;
        const moviesChannel = new LibraryChannel(opts.pith, this.dbDriver, moviesDirectory);
        const showsChannel = new LibraryChannel(opts.pith, this.dbDriver, showsDirectory);

        this.pith = opts.pith;

        // set up scanners
        const scannerOpts = {
            db: new Repository(this.dbDriver)
        };
        this.scanners = {
            movies: moviesScanner(scannerOpts),
            tvshows: showsScanner(scannerOpts)
        };
        setTimeout(() => {
            self.scan(false);
        }, 10000);

        opts.pith.registerChannel({
            id: 'movies',
            title: 'Movies',
            init() {
                return moviesChannel;
            },
            sequence: 2
        });

        opts.pith.registerChannel({
            id: 'shows',
            title: 'Shows',
            init() {
                return showsChannel;
            }
        });
    }

    async scan(manual) {
        const plug = this;

        logger.info("Starting library scan");
        const scanStartTime = new Date().getTime();

        try {
            const scanningCandidates = this.settingsStore.settings.library.folders.filter(c => plug.scanners[c.contains] !== undefined && (c.scanAutomatically || manual === true));
            for (const dir of scanningCandidates) {
                const channelInstance = plug.pith.getChannelInstance(dir.channelId);
                if (channelInstance !== undefined) {
                    await plug.scanners[dir.contains].scan(channelInstance, dir);
                }
            }
        } catch (e) {
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
