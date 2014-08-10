var Pith = require("./pith.js");
var rest = require("./lib/pithrest.js");
var express = require("express");
var network = require("./lib/network.js");
var ws = require("ws");

var serverAddress = network.getDefaultServerAddress();
var port = 3333;
var pithPath = "/pith";

var pithApp = new Pith("http://" + serverAddress.IPv4 + ":" + port + pithPath);

var app = express();

app.use(pithPath, pithApp.handle);
app.use("/rest", rest(pithApp));
app.use("/webui", express.static("webui"));

app.listen(3333);

var wss = new ws.Server({port: 3334});

wss.on('connection', function(ws) {
    var listeners = [];
    ws.on('message', function(data) {
        try {
            var message = JSON.parse(data);
            switch(message.action) {
            case 'on':
                    var listener = function() {
                        ws.send(JSON.stringify({event: message.event, arguments: Array.prototype.slice.apply(arguments)}));
                    };
                    listeners.push({event: message.event, listener: listener});
                    pithApp.on(message.event, listener);
                    break;
            }
        } catch(e) {
            console.error("Error processing event message", data, e);
        }
    });
    ws.on('close', function() {
        console.log("Client disconnected, cleaning up listeners");
        listeners.forEach(function(e) {
            pithApp.removeListener(e.event, e.listener); 
        });
    });
});

module.exports = Pith;
