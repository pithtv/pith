var ssdp = require("ssdp-client");
var xml2js = require("xml2js").parseString;
var request = require("request");
var events = require("events");
var $url = require("url");

var Global = require("../../lib/global");

var client = ssdp({unicastHost: Global.bindAddress});

var iconTypePreference = [
    'image/jpeg',
    'image/bmp',
    'image/gif',
    'image/png'];

var sequence = 0;

var players = {};

function MediaRenderer(config) {
    this.__config = config;
    this.status = {};
    
    for(var x in config.props) {
        this[x] = config.props[x];
    }
    
    this.startWatching();
}

function parseTime(time) {
    if(time._) time = time._;
    return time.split(":").reduce(function(a,b) {
       return a*60 + parseInt(b); 
    }, 0);
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
    return t._ || t;
}

function sendCommand(service, command, parameters, cb) {
    var url = service.url;
    var soapAction = service.type + "#" + command;
    var body = "<u:" + command + " xmlns:u=\"" + service.type + "\">";
    for(var x in parameters) {
        body += "<" + x + ">" + parameters[x] + "</" + x + ">";
    }
    body += "</u:" + command + ">";
    
    var contentType = "text/xml; charset=utf-8";
    var postData="<?xml version=\"1.0\" encoding=\"utf-8\" standalone=\"yes\"?><s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\"><s:Body>" + body + "</s:Body></s:Envelope>";
    var options = {
        url: url,
        headers: {
            'Content-Type': contentType,
            'SOAPAction': '"' + soapAction + '"',
        },
        method: 'POST',
        body: postData
    };
    
    request(options, function(err, res, body) {
        if(err) {
            cb(err);
        } else if(res.statusCode != 200) {
            if(body) {
                xml2js(body, function(err,upnpReply) {
                    if(err) {
                        cb(err);
                    } else {
                        var fault = upnpReply['s:Envelope']['s:Body'][0]['s:Fault'][0];
                        console.log(fault.detail[0].UPnPError[0]);
                        var error = {
                            error: 'UPnP Error',
                            code: _(fault.detail[0].UPnPError[0].errorCode[0]),
                            message: _(fault.detail[0].UPnPError[0].errorDescription[0])
                        };
                        if(cb!==undefined) {
                            cb(error);
                        }
                    }
                });
            } else {
                cb("Empty response body");
            }
        } else {
            if(cb!==undefined) {
                if(body) {
                    xml2js(body, function(err, bodyObject) {
                        if(!err) {
                            cb(null, bodyObject);
                        } else {
                            cb(err);
                        }
                    });
                } else {
                    cb(null);
                }
            }
        }
    });
}

MediaRenderer.prototype = {
    load: function(mediaUrl, cb) {
        var renderer = this;
        
        console.log("Loading " + mediaUrl);
        
        function doLoad() {
            sendCommand(renderer.__config.avTransport, "SetAVTransportURI", {
                InstanceID: 0,
                CurrentURI: mediaUrl,
                CurrentURIMetaData: ""
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
        sendCommand(this.__config.avTransport, "Play", {
            InstanceID: 0,
            Speed: 1
        }, cb);
    },
    
    stop: function(cb) {
        sendCommand(this.__config.avTransport, "Stop", {
            InstanceID: 0
        }, cb);
    },
    
    pause: function(cb) {
        sendCommand(this.__config.avTransport, "Pause", {
            InstanceID: 0
        }, cb);
    },
    
    seek: function(cb, query) {
        var time = formatTime(query.time);
        console.log(query.time + " -> " + time);
        sendCommand(this.__config.avTransport, "Seek", {
            InstanceID: 0,
            Unit: "REL_TIME",
            Target: time
        }, cb);
    },
    
    getPositionInfo: function(cb) {
        sendCommand(this.__config.avTransport, "GetPositionInfo", {
            InstanceID: 0
        }, function(err, reply) {
                if(err) { cb(err); return; }
                
                var positionInfo = reply['s:Envelope']['s:Body'][0]['u:GetPositionInfoResponse'][0];
                var pos = {
                    track: positionInfo.Track[0],
                    AbsCount: positionInfo.AbsCount[0],
                    RelCount: positionInfo.RelCount[0],
                    AbsTime: parseTime(positionInfo.AbsTime[0]),
                    time: parseTime(positionInfo.RelTime[0]),
                    uri: positionInfo.TrackURI[0],
                    duration: parseTime(positionInfo.TrackDuration[0])
                };

                if(positionInfo.TrackMetaData && positionInfo.TrackMetaData[0]) {
                    xml2js(positionInfo.TrackMetaData[0], function(err, meta) {
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
                } else {
                    cb(null, pos);
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
    
    __processEventBody: function(data) {
        var renderer = this;
        xml2js(data, function(err, evt) {
            for(var evtType in evt) {
                var subEvt = evt[evtType];
                switch(evtType) {
                case 'e:propertyset':
                    var props = subEvt['e:property'];
                    props.forEach(function(e) {
                        if(e.LastChange) {
                            var changeEvent = e.LastChange[0];
                            xml2js(changeEvent, function(err, body) {
                                var didl = body.Event.InstanceID[0];
                                
                                if(didl.CurrentTransportActions) {
                                    var actions = didl.CurrentTransportActions[0].$.val.match(/(([^,\\]|\\\\|\\,|\\)+)/g);
                                    renderer.status.actions = {};
                                    if(actions) actions.forEach(function(state) {
                                        renderer.status.actions[state.toLowerCase()] = true;
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
                                    renderer.status.state = status;
                                }
                                
                                renderer.updatePositionInfo();
                            });
                        }
                    });
                }
            }
        });
    },
    
    startWatching: function() {
        var callbackUri = "/upnpevt/" + sequence + "/"; 
        var self = this;
        this.__config.pithApp.route.use(callbackUri, function(req,res) {
            var data = '';
            
            res.status(100);
            
            req.on('data', function(chunk) {
                data += chunk;
            });
            req.on('end', function() {
                self.__processEventBody(data);
                res.status(200);
                res.end();
            });
        });
        callbackUri = this.__config.pithApp.rootUrl + callbackUri;
        
        var options = {
            method: "SUBSCRIBE",
            url: this.__config.avTransport.eventUrl,
            headers: {
                CALLBACK: "<" + callbackUri + ">",
                NT: "upnp:event",
                TIMEOUT: "Second-300"
            }
        };
        
        request(options, function() {
        });
        
        setInterval(function() {
            self.updatePositionInfo();
        }, 1000);
    }
};

MediaRenderer.prototype.__proto__ = events.EventEmitter.prototype;

function createMediaRenderer(headers, rinfo, opts, cb) {
    request(headers.LOCATION, function(err, res, body) {
        if(err) return;
        
        xml2js(body, function(err, descriptor) {
            var config = {pithApp: opts.pith, props: {
                icons: {}
            }};
            
            function fullUrl(url) {
                return $url.resolve(headers.LOCATION, url);
            }
            
            var device = descriptor.root.device[0];
            device.serviceList[0].service.forEach(function(e) {
                var ctrlUrl = fullUrl(e.controlURL[0]);
                var evtUrl = fullUrl(e.eventSubURL[0]);
                var service = {
                    url: ctrlUrl,
                    eventUrl: evtUrl,
                    type: e.serviceType[0]
                };
                    
                switch(e.serviceType[0]) {
                case 'urn:schemas-upnp-org:service:AVTransport:1':
                    config.avTransport = service;
                    break;
                case 'urn:schemas-upnp-org:service:RenderingControl:1':
                    config.renderingControl = service;
                    break;
                }
            });
            
            device.iconList[0].icon.forEach(function(e) {
                var dimensions = e.width[0] + "x" + e.height[0];
                var icon = {
                    type: e.mimetype[0],
                    url: fullUrl(e.url[0]),
                    width: e.width[0],
                    height: e.height[0]
                };
                if(!config.props.icons[dimensions] || // no icon of the given dimensions found yet
                    iconTypePreference.indexOf(icon.type) > iconTypePreference.indexOf(config.props.icons[dimensions].type) // or the new icon type has greater preference over existing one
                ) {
                   config.props.icons[dimensions] = icon;
                }
            });
            
            config.props.friendlyName = device.friendlyName[0];
            
            config.props.id = headers.USN;
            
            cb(new MediaRenderer(config));
        });
    });
}

function init(opts) {
    client.subscribe('urn:schemas-upnp-org:service:AVTransport:1').on('response', function inResponse(data, rinfo) {
        if(!players[data.USN]) {
            createMediaRenderer(data, rinfo, opts, function(renderer) {
                players[data.USN] = renderer;
                opts.pith.registerPlayer(renderer);
            });
        }
    }).on('alive', function inAlive(data, rinfo) {
        if(!players[data.USN]) {
            createMediaRenderer(data, rinfo, opts, function(renderer) {
                players[data.USN] = renderer;
                opts.pith.registerPlayer(renderer);
            });
        }
    }).on('byebye', function inByeBye(data, rinfo) {
        if(players[data.USN]) {
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
