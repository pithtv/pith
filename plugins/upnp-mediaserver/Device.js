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

const {DeviceControlProtocol} = require("./DeviceControlProtocol");
const dgram = require('dgram');
const os = require('os');
const fs = require('fs');
const http = require('http');
const parser = require('http-string-parser');
const {HttpError} = require("./Error");
const { queue, wrap } = require("../../lib/async");
const logger = require('log4js').getLogger('pith.plugin.upnp-mediaserver.Device');

class Device extends DeviceControlProtocol {
    constructor(...opts) {
        super({
            ssdp: {
                address: '239.255.255.250',
                port: 1900,
                timeout: 1800,
                ttl: 4
            },
            iconSizes: []
        }, ...opts);

        this.broadcastSocket = dgram.createSocket({type: 'udp4', reuseAddr: true}, this.ssdpListener.bind(this));

        this.ssdpMessages = queue(async ({messages, address, port}) => {
            let socket = dgram.createSocket('udp4');
            try {
                socket.bind();
                for(let msg of messages) {
                    await wrap(cb => socket.send(msg, 0, msg.length, port, address, cb));
                }
            } finally {
                socket.close();
            }
        });

        this.init();
    }

    async init() {
        try {
            this.address = this.address || '0.0.0.0';

            let httpServer = http.createServer(this.httpListener.bind(this));
            await wrap(cb => httpServer.listen(0, this.address, cb));
            this.httpPort = httpServer.address().port;

            this.broadcastSocket.bind(this.ssdp.port, () => {
                this.broadcastSocket.addMembership(this.ssdp.address);
                this.broadcastSocket.setMulticastTTL(this.ssdp.ttl);
                this.addServices();
                this.ssdpAnnounce();
                this.emit('ready');
            });
        } catch (err) {
            this.emit('error', err);
        }
    }

    addServices() {
        this.services = {};
        for(let serviceType of this.serviceTypes) {
            this.services[serviceType] = new this.serviceReferences[serviceType](this);
        }
    }

    makeSsdpMessage(reqType, customHeaders) {
        Object.assign(customHeaders, {
            "cache-control": null,
            "server": null,
            "usn": null,
            "location": null
        });

        let headers = this.makeHeaders(customHeaders);
        let message = [
            reqType === 'ok' ? 'HTTP/1.1 200 OK' : `${reqType.toUpperCase()} * HTTP/1.1`
        ];

        message = message.concat(Object.entries(headers).map(([key, value]) => `${key.toUpperCase()}: ${value}`));
        message.push('\r\n');
        return Buffer.from(message.join('\r\n'));
    }

    makeHeaders(customHeaders) {
        let defaultHeaders = {
            'cache-control': `max-age=${this.ssdp.timeout}`,
            'content-type': 'text/xml; charset="utf-8"',
            ext: '',
            host: `${this.ssdp.address}:${this.ssdp.port}`,
            location: this.makeUrl('/device/description'),
            server: `${os.type()}/${os.release()} UPnP/${this.upnp.version.join('.')} ${this.name}/1.0`,
            usn: 'uuid:' + this.uuid + ((this.uuid === customHeaders.nt || this.uuid === customHeaders.st) ? '' : '::' + (customHeaders.nt || customHeaders.st))
        };

        let headers = {};
        for(let header of Object.keys(customHeaders)) {
            headers[header.toUpperCase()] = customHeaders[header] || defaultHeaders[header.toLowerCase()];
        }
        return headers;
    }

    makeNotificationTypes() {
        return ['upnp:rootdevice', "uuid:" + this.uuid, this.makeType()].concat(Object.values(this.services).map(service => service.makeType()));
    }

    parseRequest(msg, rinfo, cb) { // TODO promise?
        let { method, headers } = parser.parseRequest(msg);
        let mx = null, st = null;
        for(let header of Object.keys(headers)) {
            switch(header.toLowerCase()) {
                case 'mx': mx = headers[header]; break;
                case 'st': st = headers[header]; break;
            }
        }
        cb(null, {method, mx, st, address: rinfo.address, port: rinfo.port });
    }

    buildDescription() {
        return `<?xml version="1.0"?>
        <root xmlns="${this.makeNS()}">
            <specVersion><major>${this.upnp.version[0]}</major><minor>${this.upnp.version[1]}</minor></specVersion>
            <device>
                <deviceType>${this.makeType()}</deviceType>
                <friendlyName>${this.friendlyName || `${this.name} (${os.hostname()})`.substr(0, 64)}</friendlyName>
                <manufacturer>${this.manufacturer}</manufacturer>
                <modelName>${this.name.substr(0, 32)}</modelName>
                <UDN>uuid:${this.uuid}</UDN>
                <presentationURL>${this.presentationURL}</presentationURL>
                <iconList>${this.iconSizes.map(size => `
                    <icon>
                        <mimetype>image/png</mimetype>
                        <width>${size}</width>
                        <height>${size}</height>
                        <depth>8</depth>
                        <url>/icons/icon-${size}x${size}.png</url>
                    </icon>`).join("")}
                </iconList>
                <serviceList>${Object.values(this.services).map(value => `
                    <service>${value.buildServiceElement()}</service>`).join("")}
                </serviceList>
            </device>
        </root>`;
    }

    httpListener(req, res) {
        let handler = (req, cb) => {
            let [,category, serviceType, action, id] = req.url.split('/');
            switch(category) {
                case 'device':
                    cb(null, this.buildDescription());
                    break;
                case 'service':
                    this.services[serviceType].requestHandler({action, req, id}, cb);
                    break;
                case 'icons':
                    fs.readFile(`icons/${serviceType}`, (err, data) => {
                        if(err) {
                            cb(new HttpError(404));
                        } else {
                            cb(null, data, { 'Content-Type': 'image/png'});
                        }
                    });
                    break;
                default:
                    cb(new HttpError(404));
            }
        };

        // TODO simplify this.
        handler(req, (err, data, headers) => {
            if(err) {
                logger.log(`Responded with ${err.code}: ${err.message} for ${req.url}`);
                res.writeHead(err.code, {'Content-Type': 'text/plain'});
                res.write(`${err.code} - ${err.message}`);
            } else {
                let h = Object.assign({}, {
                    server: null
                }, data && {
                    'Content-Type': 'text/xml; charset="utf-8"',
                    'Content-Length': data.length
                }, headers);
                res.writeHead(200, this.makeHeaders(h));
                if(data) {
                    res.end(data);
                    return;
                }
            }
            res.end();
        });
    }

    async ssdpBroadcast(type) {
        let messages = this.makeNotificationTypes().map(nt => this.makeSsdpMessage('notify', {
            nt, nts: `ssdp:${type}`, host: null
        }));

        for(let msg of messages) {
            await( wrap(cb =>
                this.broadcastSocket.send(msg, 0, msg.length, this.ssdp.port, this.ssdp.address, cb)));
        }
    }

    ssdpSend(messages, address, port) {
        this.ssdpMessages.push({messages, address, port});
    }

    ssdpListener(msg, rinfo) {
        let answer = (address, port) => {
            this.ssdpSend(
                this.makeNotificationTypes().map(st => this.makeSsdpMessage('ok', {st: st, ext: null})),
                address,
                port
            );
        };

        let answerAfter = (maxWait, address, port) => {
            let wait = Math.floor(Math.random() * parseInt(maxWait)) * 1000;
            setTimeout(answer, wait, address, port);
        };

        let respondTo = [ 'ssdp:all', 'upnp:rootdevice', this.makeType(), this.uuid ];
        this.parseRequest(msg.toString(), rinfo, (err, req) => {
            if(req.method === 'M-SEARCH' && respondTo.indexOf(req.st) >= 0) {
                answerAfter(req.mx, req.address, req.port);
            }
        });
    }

    ssdpAnnounce() {
        this.ssdpBroadcast("byebye");
        this.ssdpBroadcast("alive");

        let makeTimeout = () => Math.floor(Math.random() * (this.ssdp.timeout / 2) * 1000);
        let announce = () => setTimeout(() => {
            this.ssdpBroadcast("alive");
            announce();
        }, makeTimeout());

        announce();
    }

}

module.exports = { Device };
