import {SSDPClient} from '../../lib/ssdp';
import {retry, wrap} from '../../lib/async';
import {getLogger} from 'log4js';
import {Global} from '../../lib/global';
import {formatTime} from '../../lib/upnp';
import Device from 'upnp-client-minimal';
import entities from 'entities';
import {EventEmitter} from 'events';
import {parseString as xml2js} from 'xml2js';
import {Icon, IPlayer, IPlayerStatus} from '../../player';
import {AVTransport, PositionInfo} from './upnp';
import {IdentifierService} from '../../settings/IdentifierService';
import {container} from 'tsyringe';
import {PithPlugin, plugin} from '../plugins';
import {buildDidlXml} from '../../lib/didl';
import {convertToDidl} from '../../lib/pith2didl';

const global = container.resolve(Global);
const client = SSDPClient({unicastHost: global.bindAddress});
const logger = getLogger('pith.plugin.upnp-mediarenderer');
const identifierService = container.resolve(IdentifierService);

const iconTypePreference = [
    'image/jpeg',
    'image/bmp',
    'image/gif',
    'image/png'
];

const players = {};

function parseTime(time) {
    if (!time) {
        return undefined;
    } else {
        return time.split(':').reduce(function (a, b) {
            return a * 60 + parseInt(b, 10);
        }, 0);
    }
}

function _(t) {
    if (!t) {
        return t;
    }
    const x = t._ || t;
    if (typeof x === 'string') {
        return x;
    } else {
        return undefined;
    }
}

class MediaRenderer extends EventEmitter implements IPlayer {
    public readonly id: string;
    private friendlyName: string;
    public icons: { [size: string]: Icon };
    private _avTransport: AVTransport;
    private _opts: any;
    public status: IPlayerStatus;
    private positionTimer: NodeJS.Timeout;

    constructor(device, opts) {
        super();

        this._opts = opts;
        this.id = device.UDN;
        this.friendlyName = device.friendlyName;

        this.icons = {};

        const self = this;

        device.icons.forEach(function (e) {
            const dimensions = e.width + 'x' + e.height;
            const icon = {
                type: e.mimetype,
                url: e.url,
                width: e.width[0],
                height: e.height[0]
            };
            if (!self.icons[dimensions] || // no icon of the given dimensions found yet
                iconTypePreference.indexOf(icon.type) > iconTypePreference.indexOf(self.icons[dimensions].type) // or the new icon type has greater preference over existing one
            ) {
                self.icons[dimensions] = icon;
            }
        });

        this._avTransport = device.services['urn:upnp-org:serviceId:AVTransport'];

        this.status = {};

        this.startWatching();
    }

    async load(channel, item) {
        let stream = await channel.getStream(item, {fingerprint: [identifierService.get('instance'), channel.id, item.id].join(':')});
        const mediaUrl = stream.url;
        logger.debug(`Loading ${mediaUrl}`);

        if (this.status.actions.stop) {
            await this.stop();
        }

        const type = stream.mimetype.split('/')[0];

        await wrap(cb => {
            this._avTransport.SetAVTransportURI({
                InstanceID: 0,
                CurrentURI: mediaUrl,
                CurrentURIMetaData:
                    entities.encodeXML(
                        this.toDidl(item, channel, `channel:${channel.id}`))
            }, cb);
        });
    }

    private toDidl(item, channel, parentId) {
        return buildDidlXml([convertToDidl(channel, item, parentId, channel.id)]);
    }

    waitForAction(action, timeout) {
        if (this.status.actions[action]) {
            return Promise.resolve(true);
        } else {
            return new Promise((resolve, reject) => {
                const waitForSeek = async (status) => {
                    if (status.actions[action]) {
                        this.removeListener('statechange', waitForSeek);
                        resolve(true);
                    }
                };
                setTimeout(() => {
                    logger.error(`Timed out waiting for ${action}`);
                    this.removeListener('statechange', waitForSeek);
                    resolve(false);
                }, timeout);
                this.on('statechange', waitForSeek);
                logger.debug(`Waiting for ${action} to become available on player`);
            });
        }
    }

    async play(time) {
        try {
            await wrap(cb => this._avTransport.Play({
                InstanceID: 0,
                Speed: 1
            }, cb));

            if (time) {
                await retry(async () => {
                    if (await this.waitForAction('seek', 3000)) {
                        await this.seek({time: time});
                    }
                }, 1000, 3000);
            }
        } catch (err) {
            logger.error('Error starting playback on UPnP device', err);
            throw err;
        }
    }

    stop() {
        return wrap(cb => this._avTransport.Stop({
            InstanceID: 0
        }, cb));
    }

    pause() {
        return wrap(cb => this._avTransport.Pause({
            InstanceID: 0
        }, cb));
    }

    seek(query) {
        const time = formatTime(query.time);
        return wrap(cb => this._avTransport.Seek({
            InstanceID: 0,
            Unit: 'REL_TIME',
            Target: time
        }, cb));
    }

    async getPositionInfo() {
        const positionInfo = await wrap<PositionInfo>(cb => this._avTransport.GetPositionInfo({InstanceID: 0}, cb));

        const pos = {
            track: positionInfo.Track,
            AbsCount: positionInfo.AbsCount,
            RelCount: positionInfo.RelCount,
            AbsTime: parseTime(_(positionInfo.AbsTime)),
            time: parseTime(_(positionInfo.RelTime)),
            uri: positionInfo.TrackURI,
            duration: parseTime(_(positionInfo.TrackDuration)),
            fingerprint: undefined,
            title: undefined,
            genre: undefined,
            itemId: undefined,
            channelId: undefined
        };

        if (positionInfo.TrackMetaData && typeof positionInfo.TrackMetaData === 'string') {
            const meta = await wrap(cb => xml2js(positionInfo.TrackMetaData, cb));
            const didlLite = meta['DIDL-Lite'].item[0];
            pos.fingerprint = decodeURIComponent(didlLite.$.id.match(identifierService.get('instance') + '[^/]*'));
            for (let x of Object.keys(didlLite)) {
                const val = didlLite[x][0];
                switch (x) {
                    case 'dc:title':
                        pos.title = val;
                        break;
                    case 'upnp:genre':
                        pos.genre = val;
                        break;
                    case 'pith:itemId':
                        pos.itemId = val;
                        break;
                    case 'pith:channelId':
                        pos.channelId = val;
                        break;
                }
            }
            return pos;
        }
    }

    async updatePositionInfo() {
        const positionInfo = await this.getPositionInfo();
        if (positionInfo) {
            let channelId = positionInfo.channelId, itemId = positionInfo.itemId;
            if (!channelId || !itemId) {
                const fingerprint = positionInfo.fingerprint;
                const parts = fingerprint.match(/^[^:]*:([^:]*):(.*)$/);
                if (parts) {
                    [, channelId, itemId] = parts;
                }
            }
            if (channelId && itemId) {
                this._opts.pith.putPlayState(channelId, itemId, {
                    time: positionInfo.time,
                    duration: positionInfo.duration
                });
            }

            this.status.position = positionInfo;
            this.emit('statechange', this.status);
        }
    }

    startWatching() {
        this._avTransport.on('LastChange', (changeEvent) => {
            xml2js(changeEvent, (err, body) => {
                if (!body) {
                    logger.error('Empty body in LastChange event');
                } else if (err) {
                    logger.error('Error in LastChange event', err);
                } else {
                    const didl = body.Event.InstanceID[0];

                    if (didl.CurrentTransportActions) {
                        const actions = didl.CurrentTransportActions[0].$.val.match(/(([^,\\]|\\\\|\\,|\\)+)/g);
                        this.status.actions = {};
                        if (actions) {
                            actions.forEach((state) => {
                                this.status.actions[state.toLowerCase()] = true;
                            });
                        }
                    }
                    if (didl.TransportState) {
                        let state = didl.TransportState[0];
                        let statusFlags;
                        switch (state.$.val) {
                            case 'PAUSED_PLAYBACK':
                                statusFlags = {paused: true};
                                break;
                            case 'PLAYING':
                                statusFlags = {playing: true};
                                break;
                            case 'STOPPED':
                                statusFlags = {stopped: true};
                                break;
                            case 'TRANSITIONING':
                                statusFlags = {transitioning: true};
                                break;
                        }
                        this.status.state = statusFlags;
                    }

                    this.updatePositionInfo();
                }
            });

        });

        this.positionTimer = setInterval(() => {
            this.updatePositionInfo();
        }, 1000);
    }

    offline() {
        logger.info(`Device went offline: ${this.friendlyName}`);
        if (this.positionTimer) {
            clearInterval(this.positionTimer);
            this.positionTimer = null;
        }
    }
}

@plugin()
export default class UPnPMediaRendererPlugin implements PithPlugin {
    init(opts) {
        function handlePresence(data, rinfo) {
            if (!players[data.USN]) {
                handlePlayerAppearance(data, rinfo, opts, function (err, renderer) {
                    if (err) {
                        logger.log('Error in handlePlayerAppearance', err);
                    } else if (!(data.USN in players)) {
                        players[data.USN] = renderer;
                        opts.pith.registerPlayer(renderer);
                    }
                });
            }
        }

        function handleDisappearance(data) {
            if (data.USN in players) {
                players[data.USN].offline();
                opts.pith.unregisterPlayer(players[data.USN]);
                delete players[data.USN];
            }
        }

        client.subscribe('urn:schemas-upnp-org:device:MediaRenderer:1')
            .on('response', handlePresence)
            .on('alive', handlePresence)
            .on('byebye', handleDisappearance)
            .on('timeout', handleDisappearance);
    }
}

function handlePlayerAppearance(headers, rinfo, opts, cb) {
    Device({descriptorUrl: headers.LOCATION}, function (err, device) {
        if (err) {
            cb(err);
        } else {
            cb(false, new MediaRenderer(device, opts));
        }
    });
}

