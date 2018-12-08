var dgram = require('dgram');
var EventEmitter = require("events").EventEmitter;

var newline = /\r\n/g;
var httpHeader = /^(\w+):\s+(.*$)/;
var notifyCommand = /^NOTIFY .* HTTP\/1.[01]$/;
var searchReply = /^HTTP\/1.[01]\s+200\s+OK$/;

function SSDPClient(opts) {

    var emitters = {
    };

    if(!opts) {
        opts = {};
    }

    var multicastHost = opts.multicastHost || "239.255.255.250";
    var multicastPort = opts.multicastPort || 1900;
    var unicastHost = opts.unicastHost || "0.0.0.0";

    function listenForNotifications(callback) {
        var client = dgram.createSocket({type: 'udp4', reuseAddr: true});
        client.on("message", function(msg, rinfo) {
            var body = msg.toString().split(newline);
            if(body[0].match(notifyCommand)) {
                var data = {};
                body.forEach(function(line) {
                    var m = line.match(httpHeader);
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
        var nt = data.NT;
        var emitter = emitters[nt];
        if(emitter) {
            switch(data.NTS) {
                case "ssdp:alive":
                    emitter.emit("alive", data); break;
                case "ssdp:byebye":
                    emitter.emit("byebye", data); break;
            }
        }
    });

    function subscribe(nt) {
        var emitter = emitters[nt];
        if(!emitter) {
            emitter = emitters[nt] = new EventEmitter();
        }
        search(nt, function(data) {
            emitter.emit("response", data);
        });
        return emitter;
    }

    function search(nt, callback) {
        var client = dgram.createSocket("udp4");
        client.bind(function() {
            var message = new Buffer(
                "M-SEARCH * HTTP/1.1\r\n" +
                "HOST:239.255.255.250:1900\r\n" +
                "MAN:\"ssdp:discover\"\r\n" +
                "ST:" + nt + "\r\n" + // Essential, used by the client to specify what they want to discover, eg 'ST:ge:fridge'
                "MX:1\r\n" + // 1 second to respond (but they all respond immediately?)
                "\r\n"
            );

            client.on("message", function(msg, rinfo) {
                var body = msg.toString().split(newline);
                if(body[0].match(searchReply)) {
                    var data = {};
                    body.forEach(function(l) {
                        var p = l.match(httpHeader);
                        if(p) {
                            data[p[1].toUpperCase()] = p[2];
                        }
                    });

                    if(data.ST == nt) {
                        // double check if servicetype matches
                        callback(data);
                    }
                }
            });

            client.send(message, 0, message.length, multicastPort, multicastHost);
        });
    }

    return {
        subscribe: subscribe
    };
}

module.exports = SSDPClient;