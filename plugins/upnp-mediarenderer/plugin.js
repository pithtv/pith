var ssdp = require("node-ssdp");
var xml2js = require("xml2js").parseString;
var http = require("http");
var request = require("request");
var events = require("events");

var client = new ssdp.Client({unicastHost: '192.168.1.4'});

var iconTypePreference = [
    'image/jpeg',
    'image/bmp',
    'image/gif',
    'image/png'];

var sequence = 0;

function MediaRenderer(config) {
    this.__config = config;
    this.status = {};
    
    for(var x in config.props) {
        this[x] = config.props[x];
    }
    
    this.startWatching();
}

function parseTime(time) {
    return time.split(":").reduce(function(a,b) {
       return a*60 + parseInt(b); 
    }, 0);
}

function sendCommand(url, soapAction, body, cb) {
    var contentType = "text/xml; charset=utf-8"
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
        if(res.statusCode != 200) {
            xml2js(body, function(err,upnpReply) {
                var fault = upnpReply['s:Envelope']['s:Body'][0]['s:Fault'][0];
                console.log(fault.detail[0].UPnPError[0]);
                var error = {
                    error: 'UPnP Error',
                    code: fault.detail[0].UPnPError[0].errorCode[0],
                    message: fault.detail[0].UPnPError[0].errorDescription[0]
                };
                if(cb!==undefined) {
                    cb(error);
                }
            });
        } else {
            if(cb!==undefined) {
                if(body) {
                    xml2js(body, function(err, bodyObject) {
                        cb(bodyObject);
                    });
                } else {
                    cb();
                }
            }
        }
    });
}

MediaRenderer.prototype = {
    load: function(mediaUrl, cb) {
        var renderer = this;
        this.stop(function(err) {
            if(err && err.error) {
                cb(err);
            } else {
                sendCommand(renderer.__config.avTransportUrl, "urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI",
                            "<u:SetAVTransportURI xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\">" +
                                "<InstanceID>0</InstanceID>" + 
                                "<CurrentURI>" + mediaUrl + "</CurrentURI>"+
                                "<CurrentURIMetaData></CurrentURIMetaData>"+
                            "</u:SetAVTransportURI>", cb);
            }
        });
    },
    
    play: function(cb) {
        sendCommand(this.__config.avTransportUrl, "urn:schemas-upnp-org:service:AVTransport:1#Play",
                    "<u:Play xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>", cb);
    },
    
    stop: function(cb) {
        sendCommand(this.__config.avTransportUrl, "urn:schemas-upnp-org:service:AVTransport:1#Stop",
                    "<u:Stop xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\"><InstanceID>0</InstanceID></u:Stop>", cb);
    },
    
    pause: function(cb) {
        sendCommand(this.__config.avTransportUrl, "urn:schemas-upnp-org:service:AVTransport:1#Pause",
                    "<u:Pause xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\"><InstanceID>0</InstanceID></u:Pause>", cb);
    },
    
    getPositionInfo: function(cb) {
        sendCommand(this.__config.avTransportUrl, "urn:schemas-upnp-org:service:AVTransport:1#GetPositionInfo",
            "<u:GetPositionInfo xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\"><InstanceID>0</InstanceID></u:GetPositionInfo>", function(reply) {
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
                        var didlLite = meta['DIDL-Lite'].item[0];
                        for(var x in didlLite) {
                            var val = didlLite[x][0];
                            switch(x) {
                                case 'dc:title': pos.title = val; break;
                                case 'upnp:genre': pos.genre = val; break;
                            }
                        }

                        cb(pos);
                    });
                } else {
                    cb(pos);
                }
        });
    },
    
    __processEventBody: function(data) {
        renderer = this;
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
                                        renderer.status.actions[state] = true;
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
                                
                                renderer.getPositionInfo(function(positionInfo) {
                                    if(!positionInfo.error) {
                                        renderer.status.position = positionInfo;
                                    }
                                    renderer.emit('statechange', renderer.status);
                                });
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
            url: this.__config.avTransportEvtUrl,
            headers: {
                CALLBACK: "<" + callbackUri + ">",
                NT: "upnp:event",
                TIMEOUT: "Second-300"
            }
        };
        
        request(options, function() {
        });
    }
}

MediaRenderer.prototype.__proto__ = events.EventEmitter.prototype;

function createMediaRenderer(headers, rinfo, opts, cb) {
    request(headers.LOCATION, function(err, res, body) {
        if(err) return;
        
        xml2js(body, function(err, descriptor) {
            var config = {pithApp: opts.pith, props: {
                icons: {}
            }};
            
            var uriRoot = headers.LOCATION.replace(/(http:\/\/[^\/]*).*/, '$1');
            
            function fullUrl(url) {
                if(url.match(/^http:\/\//) == null) {
                    return uriRoot + url;
                } else {
                    return url;
                }
            }
            
            var device = descriptor.root.device[0];
            device.serviceList[0].service.forEach(function(e) {
                var ctrlUrl = fullUrl(e.controlURL[0]);
                var evtUrl = fullUrl(e.eventSubURL[0]);

                switch(e.serviceType[0]) {
                case 'urn:schemas-upnp-org:service:AVTransport:1':
                    config.avTransportUrl = ctrlUrl;
                    config.avTransportEvtUrl = evtUrl;
                    break;
                case 'urn:schemas-upnp-org:service:RenderingControl:1':
                    config.renderingControlUrl = ctrlUrl;
                    config.renderingControlEvtUrl = evtUrl;
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
            
            cb(new MediaRenderer(config));
        });
    });
}

function init(opts) {
    client.on('response', function inResponse(headers, code, rinfo) {
        createMediaRenderer(headers, rinfo, opts, function(renderer) {
            opts.pith.registerPlayer(renderer); 
        });
    });

    client.search('urn:schemas-upnp-org:service:AVTransport:1');
}

module.exports.plugin = function() {
    return {
        init: init
    }
};
