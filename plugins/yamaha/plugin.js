var upnpmediarenderer = require("../upnp-mediarenderer/plugin"),
    override = require("../../lib/override"),
    request = require("request"),
    xml2js = require("xml2js").parseString,
    url = require("url"),
    util = require("util"),
    YamahaReceiver = require("./ync");

function YamahaRenderer(device, opts, ydesc) {
    upnpmediarenderer.MediaRenderer.apply(this, [device, opts]);
}

util.inherits(YamahaRenderer, upnpmediarenderer.MediaRenderer);

override(upnpmediarenderer, function($super) {
    return {
        createRenderer: function(device, opts, callback) {
            if(device.descriptor.root['yamaha:X_device']) {
                var yamahaDevice = device.descriptor.root['yamaha:X_device'][0],
                    remoteControlService = yamahaDevice['yamaha:X_serviceList'][0]['yamaha:X_service'].filter(function(service) {
                        return service['yamaha:X_specType'][0] == 'urn:schemas-yamaha-com:service:X_YamahaRemoteControl:1';
                    })[0],
                    baseUrl = yamahaDevice['yamaha:X_URLBase'][0];

                if(remoteControlService) {
                    var descUrl = url.resolve(baseUrl, remoteControlService['yamaha:X_unitDescURL'][0]),
                        ctrlUrl = url.resolve(baseUrl, remoteControlService['yamaha:X_controlURL'][0]);
                    
                    request(descUrl, function(error, response, body) {
                        xml2js(body, function(err, root) {
                            return $super.createRenderer(device, opts, callback);
                        });
                    });
                } else {
                    return $super.createRenderer(device, opts, callback);
                }
            } else {
                return $super.createRenderer(device, opts, callback);
            }
        }
    }
});

module.exports = {
    init: function(opts) {
        // nothing to do here
    }
};
