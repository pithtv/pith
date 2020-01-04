const ssdp = require("../../lib/ssdp");
const xml2js = require("xml2js").parseString;
const {EventEmitter} = require("events");
const entities = require("entities");
const Device = require("upnp-client-minimal");
const {formatTime,formatMsDuration} = require('../../lib/upnp');
const Global = require("../../lib/global")();
const client = ssdp({unicastHost: Global.bindAddress});
const logger = require('log4js').getLogger('pith.plugin.upnp-mediarenderer');

const iconTypePreference = [
    'image/jpeg',
    'image/bmp',
    'image/gif',
    'image/png'
];

const players = {};

function parseTime(time) {
    if(!time) {
        return undefined;
    } else {
        return time.split(":").reduce(function(a,b) {
            return a*60 + parseInt(b,10);
        }, 0);
    }
}

function _(t) {
    if(!t) return t;
    const x = t._ || t;
    if(typeof x === 'string') {
        return x;
    } else {
        return undefined;
    }
}

class MediaRenderer extends EventEmitter {
    constructor(device, opts) {
        super();

        this._device = device;
        this._opts = opts;

        this.id = device.UDN;

        this.friendlyName = device.friendlyName;

        this.icons = {};

        const self = this;

        device.icons.forEach(function (e) {
            const dimensions = e.width + "x" + e.height;
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

    load(channel, item, cb) {
        const renderer = this;

        channel.getStream(item, {fingerprint: [Global.persistentUuid('instance'), channel.id, item.id].join(':')}).then(stream => {
            const mediaUrl = stream.url;
            logger.debug(`Loading ${mediaUrl}`);

            function doLoad() {
                const type = stream.mimetype.split('/')[0];

                renderer._avTransport.SetAVTransportURI({
                    InstanceID: 0,
                    CurrentURI: mediaUrl,
                    CurrentURIMetaData:
                        entities.encodeXML(
                            `<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:pith="http://github.com/evinyatar/pith/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"><item id="${entities.encodeXML(item.id)}" parentID="0" restricted="1"><dc:title>${entities.encodeXML(item.title)}</dc:title><upnp:class>object.item.${type}Item</upnp:class><res duration="${formatMsDuration(stream.duration)}" protocolInfo="http-get:*:${stream.mimetype}:DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01500000000000000000000000000000">${mediaUrl}</res><pith:itemId>${entities.encodeXML(item.id)}</pith:itemId><pith:channelId>${entities.encodeXML(channel.id)}</pith:channelId></item></DIDL-Lite>
`)
                }, cb);
            }

            if(renderer.status.actions.stop) {
                renderer.stop(function(err) {
                    doLoad();
                });
            } else {
                doLoad();
            }
        }).catch(cb);
    }

    play(cb, time) {
        const renderer = this;
        this._avTransport.Play({
            InstanceID: 0,
            Speed: 1
        }, err => {
            if(err) {
                logger.error("Error starting playback on UPnP device", err);
                if(cb) cb(err);
                return;
            }

            if(time) {
                const timeout = new Date().getTime() + 3000;

                const waitForSeek = function(status) {
                    if(status.actions.seek) {
                        renderer.seek(function(err) {
                            if(err) {
                                renderer.once('statechange', waitForSeek);
                            } else {
                                cb && cb();
                            }
                        }, { time: time });
                    } else if(new Date().getTime() < timeout) {
                        renderer.once('statechange', waitForSeek);
                    } else if(cb) {
                        cb("Seeking not available");
                    }
                };

                renderer.once('statechange', waitForSeek);
            } else {
                cb();
            }
        });
    }

    stop(cb) {
        this._avTransport.Stop({
            InstanceID: 0
        }, cb);
    }

    pause(cb) {
        this._avTransport.Pause({
            InstanceID: 0
        }, cb);
    }

    seek(cb, query) {
        const time = formatTime(query.time);
        this._avTransport.Seek({
            InstanceID: 0,
            Unit: "REL_TIME",
            Target: time
        }, cb);
    }

    getPositionInfo(cb) {
        this._avTransport.GetPositionInfo({InstanceID: 0}, (err, positionInfo) => {
            if(err) {
                cb(err); return;
            }

            const pos = {
                track: positionInfo.Track,
                AbsCount: positionInfo.AbsCount,
                RelCount: positionInfo.RelCount,
                AbsTime: parseTime(_(positionInfo.AbsTime)),
                time: parseTime(_(positionInfo.RelTime)),
                uri: positionInfo.TrackURI,
                duration: parseTime(_(positionInfo.TrackDuration))
            };

            if(positionInfo.TrackMetaData && typeof positionInfo.TrackMetaData === 'string') {
                xml2js(positionInfo.TrackMetaData, (err, meta) => {
                    if(!err) {
                        const didlLite = meta['DIDL-Lite'].item[0];
                        pos.fingerprint = decodeURIComponent(didlLite.$.id.match(Global.persistentUuid('instance') + "[^/]*"));
                        for(let x in didlLite) {
                            const val = didlLite[x][0];
                            switch(x) {
                                case 'dc:title': pos.title = val; break;
                                case 'upnp:genre': pos.genre = val; break;
                                case 'pith:itemId': pos.itemId = val; break;
                                case 'pith:channelId': pos.channelId = val; break;
                            }
                        }
                        cb(null, pos);
                    } else {
                        cb(err);
                    }
                });
            }
        });
    }

    updatePositionInfo(cb) {
        this.getPositionInfo((err, positionInfo) => {
            if(!err) {
                let channelId = positionInfo.channelId, itemId = positionInfo.itemId;
                if(!channelId || !itemId) {
                    const fingerprint = positionInfo.fingerprint;
                    const parts = fingerprint.match(/^[^:]*:([^:]*):(.*)$/);
                    if(parts) {
                        [,channelId,itemId] = parts;
                    }
                }
                if(channelId && itemId) {
                    this._opts.pith.putPlayState(channelId, itemId, {time: positionInfo.time, duration: positionInfo.duration});
                }

                this.status.position = positionInfo;
                this.emit('statechange', this.status);
            }
            if(cb) {
                cb(err);
            }
        });
    }

    startWatching() {
        this._avTransport.on('LastChange', (changeEvent) => {
            xml2js(changeEvent, (err, body) => {
                if(!body) {
                    logger.error("Empty body in LastChange event");
                } else if(err) {
                    logger.error("Error in LastChange event", err);
                } else {
                    const didl = body.Event.InstanceID[0];

                    if(didl.CurrentTransportActions) {
                        const actions = didl.CurrentTransportActions[0].$.val.match(/(([^,\\]|\\\\|\\,|\\)+)/g);
                        this.status.actions = {};
                        if(actions) actions.forEach((state) => {
                            this.status.actions[state.toLowerCase()] = true;
                        });
                    }
                    if(didl.TransportState) {
                        let state = didl.TransportState[0];
                        let statusFlags;
                        switch(state.$.val) {
                                case 'PAUSED_PLAYBACK': statusFlags = {paused: true}; break;
                                case 'PLAYING': statusFlags = {playing: true}; break;
                                case 'STOPPED': statusFlags = {stopped: true}; break;
                                case 'TRANSITIONING': statusFlags = {transitioning: true}; break;
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
        if(this.positionTimer) {
            clearInterval(this.positionTimer);
            this.positionTimer = null;
        }
    }
}

module.exports = {
    init(opts) {
        const plugin = this;

        function handlePresence(data, rinfo) {
            if(!players[data.USN]) {
                players[data.USN] = {}; // placeholder so we don't make them twice in case the alive is triggered before createMediaRenderer finishes
                plugin.handlePlayerAppearance(data, rinfo, opts, function(err, renderer) {
                    if(err) {
                        logger.log("Error in handlePlayerAppearance", err);
                    } else {
                        players[data.USN] = renderer;
                        opts.pith.registerPlayer(renderer);
                    }
                });
            }
        }

        function handleDisappearance(data) {
            if(players[data.USN]) {
                players[data.USN].offline();
                opts.pith.unregisterPlayer(players[data.USN]);
                players[data.USN] = undefined;
            }
        }

        client.subscribe('urn:schemas-upnp-org:device:MediaRenderer:1')
            .on('response', handlePresence)
            .on('alive', handlePresence)
            .on('byebye', handleDisappearance)
            .on('timeout', handleDisappearance);
    },

    handlePlayerAppearance(headers, rinfo, opts, cb) {
        const plugin = this;
        Device({descriptorUrl: headers.LOCATION}, function(err, device) {
            if(err) {
                cb(err);
            } else {
                plugin.createRenderer(device, opts, function(err, renderer) {
                    cb(false, renderer);
                });
            }
        });
    },

    createRenderer(device, opts, callback) {
        callback(false, new MediaRenderer(device, opts));
    },

    MediaRenderer: MediaRenderer
};
