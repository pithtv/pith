var ssdp = require("node-ssdp");
var xml2js = require("xml2js").parseString;
var http = require("http");
var request = require("request");

var client = new ssdp.Client();

function MediaRenderer(config) {
    this.__config = config;
    this.name = config.friendlyName;
}

function sendCommand(url, soapAction, body, cb) {
    var contentType = "text/xml; charset=utf-8"
    var postData="<?xml version=\"1.0\" encoding=\"utf-8\"?><s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\"><s:Body>" + body + "</s:Body></s:Envelope>";
    var options = {
        url: url,
        headers: {
            'Content-Type': contentType,
            'SOAPAction': '"' + soapAction + '"',
        },
        method: 'POST',
        body: postData
    };
    
    request(options, function() {
        console.log(arguments);
        if(cb!==undefined) {
            cb();
        }
    });
}

MediaRenderer.prototype = {
    load: function(mediaUrl, cb) {
        sendCommand(this.__config.avTransportUrl, "urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI",
                    "<u:SetAVTransportURI xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\">" +
                    "    <InstanceID>0</InstanceID>" + 
                    "    <CurrentURI><![CDATA[" + mediaUrl + "]]></CurrentURI>"+
                    "    <CurrentURIMetaData></CurrentURIMetaData>"+
                    "</u:SetAVTransportURI>", cb);
    },
    
    play: function(cb) {
        sendCommand(this.__config.avTransportUrl, "urn:schemas-upnp-org:service:AVTransport:1#Play",
                    "<u:Play xmlns:u=\"urn:schemas-upnp-org:service:AVTransport:1\"><InstanceID>0</InstanceID><Speed>1</Speed></u:Play>", cb);
    }
}

function createMediaRenderer(headers, rinfo, cb) {
    request(headers.LOCATION, function(err, res, body) {
        if(err) return;
        
        xml2js(body, function(err, descriptor) {
            var config = {};
            
            var uriRoot = headers.LOCATION.replace(/(http:\/\/[^\/]*).*/, '$1');
            
            var device = descriptor.root.device[0];
            device.serviceList[0].service.forEach(function(e) {
                var url = e.controlURL[0];
                if(url.match(/^http:\/\//) == null) {
                    url = uriRoot + url;
                }
                switch(e.serviceType[0]) {
                case 'urn:schemas-upnp-org:service:AVTransport:1':
                    config.avTransportUrl = url;
                    break;
                case 'urn:schemas-upnp-org:service:RenderingControl:1':
                    config.renderingControlUrl = url;
                    break;
                }
            });
            
            config.friendlyName = device.friendlyName[0];
            
            cb(new MediaRenderer(config));
        });
    });
}

function init(opts) {
    client.on('response', function inResponse(headers, code, rinfo) {
        createMediaRenderer(headers, rinfo, function(renderer) {
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
