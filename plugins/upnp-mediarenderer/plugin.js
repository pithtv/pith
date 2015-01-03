var ssdp = require("ssdp-client");
var xml2js = require("xml2js").parseString;
var events = require("events");
var entities = require("entities");
var Device = require("upnp-client-minimal");
var sprintf = require("sprintf-js").sprintf;

var Global = require("../../lib/global")();

var client = ssdp({unicastHost: Global.bindAddress});

var iconTypePreference = [
    'image/jpeg',
    'image/bmp',
    'image/gif',
    'image/png'];

var players = {};

function MediaRenderer(device, opts) {
    this._device = device;
    this._opts = opts;

    this.id = device.UDN;
    
    this.friendlyName = device.friendlyName;
    
    this.icons = {};
    
    var self = this;
    
    device.icons.forEach(function(e) {
        var dimensions = e.width + "x" + e.height;
        var icon = {
            type: e.mimetype,
            url: e.url,
            width: e.width[0],
            height: e.height[0]
        };
        if(!self.icons[dimensions] || // no icon of the given dimensions found yet
            iconTypePreference.indexOf(icon.type) > iconTypePreference.indexOf(self.icons[dimensions].type) // or the new icon type has greater preference over existing one
        ) {
           self.icons[dimensions] = icon;
        }
    });
    
    this._avTransport = device.services['urn:upnp-org:serviceId:AVTransport'];
    
    this.status = {};
    
    this.startWatching();
}

function parseTime(time) {
    if(!time) {
        return undefined;
    } else {
        return time.split(":").reduce(function(a,b) {
           return a*60 + parseInt(b,10); 
        }, 0);
    }
}

function format(n, parts, f) {
    var out = [], nn = n;
    while(parts.length) {
        var p = parts.pop(), pn = nn % p;
        out.unshift(pn);
        nn = (nn - pn) / p;
    }
    out.unshift(nn);
    out.unshift(f);
    return sprintf.apply(null, out);
}

function formatTime(time) {
    return format(time, [60, 60], "%02d:%02d:%02d");
}

function formatMsDuration(time) {
    return format(time, [60, 60, 1000], "%d:%02d:%02d.%03d");
}

function _(t) {
    if(!t) return t;
    var x = t._ || t;
    if(typeof x === 'string') {
        return x;
    } else {
        return undefined;
    }
}

MediaRenderer.prototype = {
    load: function(channel, item, cb) {
        var renderer = this;
        
        channel.getStream(item, function(err, stream) {
            if(err) {
                cb(err);
                return;
            }

            var mediaUrl = stream.url;
            console.log("Loading " + mediaUrl);
            
            function doLoad() {
                var type = item.mimetype.split('/')[0];
                
                renderer._avTransport.SetAVTransportURI({
                    InstanceID: 0,
                    CurrentURI: mediaUrl,
                    CurrentURIMetaData:
                        entities.encodeXML(
                            '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:pith="http://github.com/evinyatar/pith/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/">'+
                                '<item id="' + entities.encodeXML(item.id) + '" parentID="0" restricted="1">'+
                                    '<dc:title>' + entities.encodeXML(item.title) + '</dc:title>'+
                                    '<upnp:class>object.item.' + type + 'Item</upnp:class>'+
                                    '<res duration="' + formatMsDuration(stream.duration) + '" protocolInfo="http-get:*:' + stream.mimetype + ':DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01500000000000000000000000000000">' + mediaUrl + '</res>'+
                                    '<pith:itemId>' + entities.encodeXML(item.id) + '</pith:itemId>'+
                                    '<pith:channelId>' + entities.encodeXML(channel.id) + '</pith:channelId>'+
                                '</item>'+
                            '</DIDL-Lite>\n')
                }, cb);
            }
            
            if(renderer.status.actions.stop) {
                renderer.stop(function(err) {
                    doLoad();
                });
            } else {
                doLoad();
            }
        });
        
    },
    
    play: function(cb, time) {
        var renderer = this;
        this._avTransport.Play({
            InstanceID: 0,
            Speed: 1
        }, function(err) {
            if(err) {
                console.error(cb);
                if(cb) cb(err);
                return;
            }
            
            if(time) {
                var timeout = new Date().getTime() + 3000;
                
                function waitForSeek(status) {
                    if(status.actions.seek) {
                        renderer.seek(function(err) {
                            if(err) {
                                renderer.once('statechange', waitForSeek);
                            } else {
                                cb();
                            }
                        }, { time: time });
                    } else if(new Date().getTime() < timeout) {
                        renderer.once('statechange', waitForSeek);
                    } else if(cb) {
                        cb("Seeking not available");
                    }
                }
                
                renderer.once('statechange', waitForSeek);
            } else {
                cb();
            }
        });
    },
    
    stop: function(cb) {
        this._avTransport.Stop({
            InstanceID: 0
        }, cb);
    },
    
    pause: function(cb) {
        this._avTransport.Pause({
            InstanceID: 0
        }, cb);
    },
    
    seek: function(cb, query) {
        var time = formatTime(query.time);
        this._avTransport.Seek({
            InstanceID: 0,
            Unit: "REL_TIME",
            Target: time
        }, cb);
    },
    
    getPositionInfo: function(cb) {
        this._avTransport.GetPositionInfo({InstanceID: 0}, function(err, positionInfo) {
            if(err) {
                cb(err); return;
            }
            
            var pos = {
                track: positionInfo.Track,
                AbsCount: positionInfo.AbsCount,
                RelCount: positionInfo.RelCount,
                AbsTime: parseTime(_(positionInfo.AbsTime)),
                time: parseTime(_(positionInfo.RelTime)),
                uri: positionInfo.TrackURI,
                duration: parseTime(_(positionInfo.TrackDuration))
            };
                
            if(positionInfo.TrackMetaData && typeof positionInfo.TrackMetaData === 'string') {
                xml2js(positionInfo.TrackMetaData, function(err, meta) {
                    if(!err) {
                        var didlLite = meta['DIDL-Lite'].item[0];
                        for(var x in didlLite) {
                            var val = didlLite[x][0];
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
    },
    
    updatePositionInfo: function(cb) {
        var renderer = this;
        renderer.getPositionInfo(function(err, positionInfo) {
            if(!err) {
                if(positionInfo.channelId) {
                    renderer._opts.pith.putPlayState(positionInfo.channelId, positionInfo.itemId, {time: positionInfo.time, duration: positionInfo.duration});
                }
                
                renderer.status.position = positionInfo;
                renderer.emit('statechange', renderer.status);
            }
            if(cb) {
                cb(err);
            }
        });
    },
    
    startWatching: function() {
        var self = this;
        
        this._avTransport.on('LastChange', function(changeEvent) {
            xml2js(changeEvent, function(err, body) {
                if(!body) {
                    console.error("Body empty?");
                } else if(err) {
                    console.error(err);
                } else {
                    var didl = body.Event.InstanceID[0];

                    if(didl.CurrentTransportActions) {
                        var actions = didl.CurrentTransportActions[0].$.val.match(/(([^,\\]|\\\\|\\,|\\)+)/g);
                        self.status.actions = {};
                        if(actions) actions.forEach(function(state) {
                            self.status.actions[state.toLowerCase()] = true;
                        });
                    }
                    if(didl.TransportState) {
                        var state = didl.TransportState[0];
                        var status;
                        switch(state.$.val) {
                                case 'PAUSED_PLAYBACK': status = {paused: true}; break;
                                case 'PLAYING': status = {playing: true}; break;
                                case 'STOPPED': status = {stopped: true}; break;
                                case 'TRANSITIONING': status = {transitioning: true}; break;
                        }
                        self.status.state = status;
                    }

                    self.updatePositionInfo();

                }
            });

        });
        
        this.positionTimer = setInterval(function() {
            self.updatePositionInfo();
        }, 1000);
    },
    
    offline: function() {
        console.log("Device went offline: " + this.friendlyName);
        if(this.positionTimer) {
            clearInterval(this.positionTimer);
            this.positionTimer = null;
        }
    }
};

MediaRenderer.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = {
    init: function init(opts) {
        var plugin = this;
        function handlePresence(data, rinfo) {
            if(!players[data.USN]) {
                players[data.USN] = {}; // placeholder so we don't make them twice in case the alive is triggered before createMediaRenderer finishes
                plugin.handlePlayerAppearance(data, rinfo, opts, function(err, renderer) {
                    if(err) {
                        console.log(err);
                    } else {
                        players[data.USN] = renderer;
                        opts.pith.registerPlayer(renderer);
                    }
                });
            }
        }
        client.subscribe('urn:schemas-upnp-org:device:MediaRenderer:1')
            .on('response', handlePresence)
            .on('alive', handlePresence)
            .on('byebye', function inByeBye(data, rinfo) {
                if(players[data.USN]) {
                    players[data.USN].offline();
                    opts.pith.unregisterPlayer(players[data.USN]);
                    players[data.USN] = undefined;
                }
            });
    },

    handlePlayerAppearance: function(headers, rinfo, opts, cb) {
        var plugin = this;
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

    createRenderer: function(device, opts, callback) {
        callback(false, new MediaRenderer(device, opts));
    },

    MediaRenderer: MediaRenderer
};
