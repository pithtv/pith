var ssdp = require("ssdp-client");
var xml2js = require("xml2js").parseString;
var events = require("events");
var entities = require("entities");
var Device = require("upnp-client-minimal");

var Global = require("../../lib/global");

var client = ssdp({unicastHost: Global.bindAddress});

var iconTypePreference = [
    'image/jpeg',
    'image/bmp',
    'image/gif',
    'image/png'];

var players = {};

function MediaRenderer(device) {
    this.device = device;
    
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
    
    this.avTransport = device.services['urn:upnp-org:serviceId:AVTransport'];
    
    this.status = {};
    
    this.startWatching();
}

function parseTime(time) {
    if(!time) {
        return undefined;
    } else {
        return time.split(":").reduce(function(a,b) {
           return a*60 + parseInt(b); 
        }, 0);
    }
}

function formatTime(time) {
    var out = [];
    var t = time;
    while(out.length < 2) {
        var u = t%60;
        t = (t-u) / 60;
        out.unshift(u < 10 ? "0"+u : u);
    }
    out.unshift(t);
    return out.join(":");
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
    load: function(item, mediaUrl, cb) {
        var renderer = this;
        
        console.log("Loading " + mediaUrl);
        
        function doLoad() {
            renderer.avTransport.SetAVTransportURI({
                InstanceID: 0,
                CurrentURI: mediaUrl,
                CurrentURIMetaData:
'&lt;DIDL-Lite xmlns=&quot;urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/&quot; xmlns:dc=&quot;http://purl.org/dc/elements/1.1/&quot; xmlns:dlna=&quot;urn:schemas-dlna-org:metadata-1-0/&quot; xmlns:upnp=&quot;urn:schemas-upnp-org:metadata-1-0/upnp/&quot;&gt;'+
'\n&lt;item id=&quot;' + entities.encodeXML(entities.encodeXML(item.id)) + '&quot; parentID=&quot;0&quot; restricted=&quot;1&quot;&gt;'+
'\n&lt;dc:title&gt;&lt;![CDATA[' + entities.encodeXML(item.title) + ']]&gt;&lt;/dc:title&gt;'+
'\n&lt;upnp:class&gt;object.item.videoItem&lt;/upnp:class&gt;'+
'\n&lt;res ' + 
        'protocolInfo=&quot;http-get:*:' + item.mimetype + '&quot; '+
'&gt;' + mediaUrl + '&lt;/res&gt;'+
'\n&lt;/item&gt;'+
'\n&lt;/DIDL-Lite&gt;\n'
            }, cb);
        }
        
        if(this.status.actions.stop) {
            this.stop(function(err) {
                // if(err) {
                //     cb(err);
                // } else {
                    doLoad();
                // }
            });
        } else {
            doLoad();
        }
        
    },
    
    play: function(cb) {
        this.avTransport.Play({
            InstanceID: 0,
            Speed: 1
        }, cb);
    },
    
    stop: function(cb) {
        this.avTransport.Stop({
            InstanceID: 0
        }, cb);
    },
    
    pause: function(cb) {
        this.avTransport.Pause({
            InstanceID: 0
        }, cb);
    },
    
    seek: function(cb, query) {
        var time = formatTime(query.time);
        this.avTransport.Seek({
            InstanceID: 0,
            Unit: "REL_TIME",
            Target: time
        }, cb);
    },
    
    getPositionInfo: function(cb) {
        this.avTransport.GetPositionInfo({InstanceID: 0}, function(err, positionInfo) {
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
        
        this.avTransport.on('LastChange', function(changeEvent) {
            xml2js(changeEvent, function(err, body) {
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

function createMediaRenderer(headers, rinfo, opts, cb) {
    Device({descriptorUrl: headers.LOCATION}, function(err, device) {
        if(err) {
            cb(err);
        } else {
            cb(false, new MediaRenderer(device));
        }
    });
}

function init(opts) {
    function handlePresence(data, rinfo) {
        if(!players[data.USN]) {
            players[data.USN] = {}; // placeholder so we don't make them twice in case the alive is triggered before createMediaRenderer finishes
            createMediaRenderer(data, rinfo, opts, function(err, renderer) {
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
}

module.exports.plugin = function() {
    return {
        init: init
    };
};
