const {EventEmitter} = require("events");
const url = require('url');

class DeviceControlProtocol extends EventEmitter {
    constructor(...opts) {
        super();
        Object.assign(this, {
                schema: {
                    domain: 'schemas-upnp-org', version: [1, 0]
                },

                upnp: {
                    version: [1, 0]
                }
            },
            ...opts);
    }

    makeNS(category, suffix = '') {
        return `urn:${this.schema.domain}:${category || this.device ? 'service' : 'device'}-${this.schema.version.join('-')}${suffix}`;
    }

    makeType() {
        return `urn:${this.schema.domain}:${this.device ? 'service' : 'device'}:${this.type}:${this.version || this.device.version}`
    }

    makeUrl(pathname) {
        return url.format({
            protocol: 'http',
            hostname: this.address || this.device.address,
            port: this.httpPort || this.device.httpPort,
            pathname: pathname
        });
    }
}

module.exports = {DeviceControlProtocol};
