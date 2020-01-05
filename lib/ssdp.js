const debug = require('debug')('ssdp-client');

const dgram = require('dgram');
const EventEmitter = require("events").EventEmitter;

const newline = /\r\n/g;
const httpHeader = /^([\w-]+):\s+(.*$)/;
const notifyCommand = /^NOTIFY .* HTTP\/1.[01]$/;
const searchReply = /^HTTP\/1.[01]\s+200\s+OK$/;

function SSDPClient(opts) {

    const emitters = {};

    if(!opts) {
        opts = {};
    }

    const multicastHost = opts.multicastHost || "239.255.255.250";
    const multicastPort = opts.multicastPort || 1900;
    const unicastHost = opts.unicastHost || "0.0.0.0";
    const timeouts = {};

    function listenForNotifications(callback) {
        const client = dgram.createSocket({type: 'udp4', reuseAddr: true});
        client.on("message", function(msg, rinfo) {
            const body = msg.toString().split(newline);
            if(body[0].match(notifyCommand)) {
                const data = {};
                body.forEach(function(line) {
                    const m = line.match(httpHeader);
                    if(m) {
                        data[m[1].toUpperCase()] = m[2];
                    }
                });

                callback(data);
            }
        });

        client.bind(multicastPort, function() {
            client.addMembership(multicastHost);
        });
    }

    listenForNotifications(function(data) {
        const nt = data.NT;
        const emitter = emitters[nt];
        if(emitter) {
            switch(data.NTS) {
                case "ssdp:alive":
                    emitter.emit("alive", data);
                    updateTimeout(data, emitter);
                    break;
                case "ssdp:byebye":
                    emitter.emit("byebye", data); break;
            }
        }
    });

    function subscribe(nt) {
        let emitter = emitters[nt];
        if(!emitter) {
            emitter = emitters[nt] = new EventEmitter();
        }
        search(nt, emitter);
        return emitter;
    }

    function updateTimeout(data, emitter) {
        let usn = data.USN, timeout;

        debug(`Received message for ${usn}`);

        if('CACHE-CONTROL' in data) {
            let m = data['CACHE-CONTROL'].match(/^(.*, *)?max-age\s*=\s*(\d*)\s*(,.*)?$/);
            if(m) {
                timeout = parseInt(m[2]) * 1000;
            }
        } else if('EXPIRES' in data) {
            let date = new Date(data.EXPIRES);
            timeout = date - new Date();
        }

        if(usn in timeouts) {
            clearTimeout(timeouts[usn]);
            delete timeouts[usn];
        }

        if(timeout !== undefined) {
            debug(`Timeout for ${usn}: ${timeout}ms`);
            timeouts[usn] = setTimeout(() => {
                debug(`Expiring ${usn}`);
                delete timeouts[usn];

                emitter.emit("timeout", {
                    USN: usn
                });
            }, timeout);
        }
    }

    function search(nt, emitter) {
        const client = dgram.createSocket("udp4");
        client.bind(function() {
            const message = Buffer.from(
                "M-SEARCH * HTTP/1.1\r\n" +
                "HOST:239.255.255.250:1900\r\n" +
                "MAN:\"ssdp:discover\"\r\n" +
                "ST:" + nt + "\r\n" + // Essential, used by the client to specify what they want to discover, eg 'ST:ge:fridge'
                "MX:1\r\n" + // 1 second to respond (but they all respond immediately?)
                "\r\n"
            );

            client.on("message", function(msg, rinfo) {
                const body = msg.toString().split(newline);
                if(body[0].match(searchReply)) {
                    const data = {};
                    body.forEach(function(l) {
                        const p = l.match(httpHeader);
                        if(p) {
                            data[p[1].toUpperCase()] = p[2];
                        }
                    });

                    updateTimeout(data, emitter);

                    if(data.ST === nt) {
                        // double check if servicetype matches
                        emitter.emit("response", data);
                    }
                }
            });

            debug('Sending discover message');
            client.send(message, 0, message.length, multicastPort, multicastHost);
        });
    }

    return {
        subscribe: subscribe
    };
}

module.exports = SSDPClient;
