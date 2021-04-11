import "reflect-metadata";
import {IChannel, IChannelInitialiser, IChannelItem, IMediaChannelItem, IPlayState} from "../src/channel";
import {Pith} from "../src/pith";
import {Ribbon, SharedRibbons} from "../src/ribbon";
import {IStream} from "../src/stream";

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

    getStream(item: IChannelItem, opts?: any): Promise<IStream> {
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
                    title: 'Dummy Item 1'
                }, {
                    type: 'file',
                    id: 'dummy_item_2',
                    title: 'Dummy Item 2'
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
                        title: 'Dummy Item 3'
                    }];
                case 'recentlyReleased':
                    return [{
                        type: 'file',
                        id: 'dummy_item_4',
                        title: 'Dummy Item 4'
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
                id: 'dummy_item_1',
                title: 'Dummy Item 1'
            }
        }, {
            channelId: 'dummy_1', item: {
                type: 'file',
                id: 'dummy_item_2',
                title: 'Dummy Item 2'
            }
        }, {
            channelId: 'dummy_2', item: {
                type: 'file',
                id: 'dummy_item_3',
                title: 'Dummy Item 3'
            }
        }
    ]);
});
