/**
 * Based on node-upnp-device:
 * Copyright (c) 2011 Jacob Rask, <http://jacobrask.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

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
        return `urn:${this.schema.domain}:${category || (this.device ? 'service' : 'device')}-${this.schema.version.join('-')}${suffix}`;
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
