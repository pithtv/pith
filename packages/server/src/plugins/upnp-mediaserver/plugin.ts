import {MediaServer} from './MediaServer';
import {Global} from '../../lib/global';
import {getLogger} from 'log4js';
import {Pith} from '../../pith';
import {SettingsStoreSymbol} from '../../settings/SettingsStore';
import {container} from 'tsyringe';
import {IdentifierService} from '../../settings/IdentifierService';
import {PithPlugin, plugin} from '../plugins';
import {DeviceDelegate} from './Device';
import {convertToDidl} from '../../lib/pith2didl';
import {SoapError} from './Error';
import {IPlayState} from '@pithmediaserver/api';
const global = container.resolve(Global);

const settingsStore = container.resolve(SettingsStoreSymbol);
const identifierService = container.resolve(IdentifierService);

const logger = getLogger('pith.plugin.upnp-mediaserver');

class MediaServerDelegate implements DeviceDelegate {
    private pith: Pith;
    constructor(pith) {
        this.pith = pith;
    }

    async fetchChildren(id, {max, start, sort}) {
        if (id === 0 || id === '0') {
            const channels = await this.pith.listChannels();
            const items = channels.map(channel => ({
                id: `channel:${channel.id}`,
                parentId: 0,
                updateId: 0,
                type: 'container',
                properties: {
                    "dc:title": channel.title,
                    "upnp:class": "object.container"
                }
            }));
            return {
                updateId: 0,
                items,
                totalItems: items.length
            };
        } else {
            const [, channelId, , itemId] = id.match(/^channel:(\w+)(:(.*))?$/);
            const channel = this.pith.getChannelInstance(channelId);
            const contents = await channel.listContents(itemId);
            const items = contents.filter(item => !item.unavailable).map(item => convertToDidl(channel, item, id, channelId));
            return {
                updateId: 0,
                items: max === 0 ? items : items.slice(start, start + max),
                totalItems: items.length
            };
        }
    }

    async fetchObject(id) {
        const [, channelId, , itemId] = id.match(/^channel:(\w+)(:(.*))?$/) || [,,,,];
        if (itemId) {
            const channel = this.pith.getChannelInstance(channelId);
            const contents = await channel.getItem(itemId);
            const item = convertToDidl(channel, contents, id, channelId);
            return {
                updateId: 0,
                item
            };
        }
    }

    async updateObject(id: string, currentTagValue: any, newTagValue: any): Promise<any> {
        if(!newTagValue) {
            return; // we don't support deleting tags yet.
        }
        const [, channelId, , itemId] = id.match(/^channel:(\w+)(:(.*))?$/) || [,,,,];
        logger.info(`UpdateObject`, id, currentTagValue, newTagValue);
        if (itemId) {
            const channel = this.pith.getChannelInstance(channelId);
            let playstate = null as IPlayState;
            for(const [key, value] of Object.entries(newTagValue)) {
                switch (key) {
                    case "upnp:playCount":
                        if(value === "0") {
                            playstate = {...playstate, status: 'none'};
                        } else {
                            playstate = {...playstate, status: 'watched'}
                        }
                        break;
                    case "upnp:lastPlaybackPosition":
                        playstate = {...playstate, time: parseInt(value as string, 10)};
                        break;
                }
            }

            if(playstate) {
                channel.putPlayState(itemId, playstate);
            }
        } else {
            throw new SoapError(701);
        }
    }
}

@plugin()
export default class UPnPMediaServerPlugin implements PithPlugin {
    async init(opts) {
        if(settingsStore.settings.upnpsharing && settingsStore.settings.upnpsharing.enabled) {
            const mediaserver = new MediaServer({
                name: 'Pith',
                manufacturer: 'Pith',
                address: global.bindAddress,
                delegate: new MediaServerDelegate(opts.pith),
                uuid: await identifierService.get('MediaServer'),
                presentationURL: global.rootUrl,
                iconSizes: [16,32,48,64,72,96,120,128,144,152,192,256,384,512]
            });
            mediaserver.on('ready', () => {
                mediaserver.ssdpAnnounce();
            })
        }
    }
};