import {expect, test} from '@jest/globals';
import "reflect-metadata";
import {IChannel, IChannelInitialiser} from "../src/channel";
import {Pith} from "../src/pith";
import {SharedRibbons} from "../src/ribbon";
import {StreamDescriptor} from "@pithmediaserver/api/types/stream";
import {IChannelItem, IMediaChannelItem, IPlayState, Ribbon} from "@pithmediaserver/api";

export class DummyChannelInitializer implements IChannelInitialiser {
    constructor(readonly id: string, readonly title: string, readonly channel: IChannel) {
    }

    init(opts: { pith: Pith }): IChannel {
        return this.channel;
    }
}

export class DummyChannel implements IChannel {
    constructor(readonly id: string, impl: Partial<IChannel> = {}) {
        Object.assign(this, impl);
    }

    getItem(itemId: string): Promise<IChannelItem> {
        throw "Not Implemented";
    }

    getLastPlayState(itemId: string): Promise<IPlayState> {
        throw "Not Implemented";
    }

    getLastPlayStateFromItem(item: IChannelItem): Promise<IPlayState> {
        throw "Not Implemented";
    }

    getStream(item: IChannelItem, opts?: any): Promise<StreamDescriptor> {
        throw "Not Implemented";
    }

    listContents(containerId: string): IChannelItem[] | Promise<IChannelItem[]> {
        throw "Not Implemented";
    }

    putPlayState(itemId: string, state: IPlayState): Promise<void> {
        throw "Not Implemented";
    }

}

test('listRibbons', async () => {
    const pith = new Pith();
    pith.registerChannel(new DummyChannelInitializer("dummy_1", "Dummy 1", new DummyChannel("dummy_1", {
        getRibbons(): Promise<Ribbon[]> {
            return Promise.resolve([SharedRibbons.continueWatching]);
        },
        async listRibbonContents(ribbonId: string): Promise<IMediaChannelItem[]> {
            if (ribbonId === 'continueWatching') {
                return [{
                    type: 'file',
                    id: 'dummy_item_1',
                    title: 'Dummy Item 1',
                    playState: {
                        status: "inprogress",
                        time: 3000
                    },
                    mediatype: 'movie'
                }, {
                    type: 'file',
                    id: 'dummy_item_2',
                    title: 'Dummy Item 2',
                    playState: {
                        status: "inprogress",
                        time: 8000
                    },
                    mediatype: 'movie'
                }];
            }
            return [];
        }
    })));
    pith.registerChannel(new DummyChannelInitializer("dummy_2", "Dummy 2", new DummyChannel("dummy_2", {
        getRibbons(): Promise<Ribbon[]> {
            return Promise.resolve([SharedRibbons.continueWatching, SharedRibbons.recentlyReleased]);
        },
        async listRibbonContents(ribbonId: string): Promise<IMediaChannelItem[]> {
            switch (ribbonId) {
                case 'continueWatching':
                    return [{
                        type: 'file',
                        id: 'dummy_item_3',
                        title: 'Dummy Item 3',
                        playState: {
                            status: "inprogress",
                            time: 6000
                        },
                        mediatype: 'movie'
                    }];
                case 'recentlyReleased':
                    return [{
                        type: 'file',
                        id: 'dummy_item_4',
                        title: 'Dummy Item 4',
                        mediatype: 'movie'
                    }];
            }
        }
    })));
    pith.registerChannel(new DummyChannelInitializer("dummy_3", "Dummy 3", new DummyChannel("dummy_2")));
    const ribbons = await pith.listRibbons();
    expect(ribbons).toEqual([
        SharedRibbons.continueWatching, SharedRibbons.recentlyReleased
    ]);

    const ribbonContents = await pith.listRibbonContents('continueWatching');
    expect(ribbonContents).toEqual([
        {
            channelId: 'dummy_1', item: {
                type: 'file',
                id: 'dummy_item_2',
                title: 'Dummy Item 2',
                playState: {
                    status: "inprogress",
                    time: 8000
                },
                mediatype: 'movie'
            }
        }, {
            channelId: 'dummy_2', item: {
                type: 'file',
                id: 'dummy_item_3',
                title: 'Dummy Item 3',
                playState: {
                    status: "inprogress",
                    time: 6000
                },
                mediatype: 'movie'
            }
        }, {
            channelId: 'dummy_1', item: {
                type: 'file',
                id: 'dummy_item_1',
                title: 'Dummy Item 1',
                playState: {
                    status: "inprogress",
                    time: 3000
                },
                mediatype: 'movie'
            }
        }
    ]);
});
