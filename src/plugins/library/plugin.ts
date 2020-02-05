import lib from '../../lib/global';

import {Channel} from '../../lib/channel';
import {getLogger} from 'log4js';
import async from 'async';
import {Repository} from './database';
import {Pith} from '../../pith';
import moviesDirectory from './directory.movies';
import showsDirectory from './directory.shows';
import moviesScanner from './scanner.movie';
import showsScanner from './scanner.tvshow';

const logger = getLogger("pith.plugin.library");
const global = lib();

class LibraryChannel extends Channel {
    private pithApp: Pith;
    private db: Repository;
    private directory: any;

    constructor(pithApp, directoryFactory) {
        super();

        this.pithApp = pithApp;
        this.db = new Repository(pithApp.db);

        this.directory = directoryFactory(this);
    }

    listContents(containerId) {
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

    listContentsWithPlayStates(path) {
        return this.listContents(path).then(contents =>
            Promise.all(contents.map(item => {
                if(item.playState) {
                    return item;
                } else {
                    return this.getLastPlayStateFromItem(item).then(playState => {
                        item.playState = playState;
                        return item;
                    })
                }
            }))
        );
    }

    getItem(itemId) {
        if(!itemId) {
            return Promise.resolve({ title: "Movies" });
        } else {
            const i = itemId.indexOf('/');

            const directoryId = i > -1 ? itemId.substring(0, i) : itemId;

            const directory = this.directory.filter(function (e) {
                return e.id === directoryId;
            })[0];

            if(!directory) {
                return Promise.reject(Error("Not found"));
            }

            if(directory._getItem) {
                return directory._getItem(i > -1 ? itemId.substring(i+1).replace(/\/$/,'') : null);
            } else {
                return Promise.resolve({id: itemId});
            }
        }
    }

    getStream(item, options) {
        const channel = this;
        const targetChannel = channel.pithApp.getChannelInstance(item.channelId);
        return targetChannel.getItem(item.originalId).then(item => targetChannel.getStream(item, options));
    }

    getLastPlayStateFromItem(item) {
        if(item && item.originalId) {
            const targetChannel = this.pithApp.getChannelInstance(item.channelId);
            return targetChannel.getLastPlayState(item.originalId);
        } else {
            return Promise.resolve(undefined);
        }
    }

    getLastPlayState(itemId) {
        return this.getItem(itemId).then(item => this.getLastPlayStateFromItem(item));
    }

    putPlayState(itemId, state) {
        const self = this;
        return this.getItem(itemId).then(item => {
            const targetChannel = self.pithApp.getChannelInstance(item.channelId);
            return targetChannel.putPlayState(item.originalId, state);
        });
    }
}

module.exports = {
    init: function(opts) {
        const self = this, pith = opts.pith;
        const moviesChannel = new LibraryChannel(opts.pith, moviesDirectory);
        const showsChannel = new LibraryChannel(opts.pith, showsDirectory);

        // set up scanners
        const scannerOpts = {
            db: new Repository(opts.pith.db)
        };
        const scanners = {
            movies: moviesScanner(scannerOpts),
            tvshows: showsScanner(scannerOpts)
        };
        setTimeout(function() {
            self.scan();
        }, 10000);

        this.scan = function(manual) {
            const plug = this;

            logger.info("Starting library scan");
            const scanStartTime = new Date().getTime();

            async.eachSeries(global.settings.library.folders.filter(function(c) {
                return scanners[c.contains] !== undefined && (c.scanAutomatically || manual === true);
            }), function(dir, cb) {
                const channelInstance = pith.getChannelInstance(dir.channelId);
                if(channelInstance !== undefined) {
                    scanners[dir.contains].scan(channelInstance, dir, cb);
                }
            }, function(err) {
                const scanEndTime = new Date().getTime();
                logger.info("Library scan complete. Took %d ms", (scanEndTime - scanStartTime));
                setTimeout(function () {
                    plug.scan();
                }, global.settings.library.scanInterval);
            });
        };

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
};