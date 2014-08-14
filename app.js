var Pith = require("./pith.js");
var rest = require("./lib/pithrest.js");
var express = require("express");
var network = require("./lib/network.js");
var http = require("http");
var ws = require("ws");
var http = require("http");
var tingodb = require("tingodb")();

var serverAddress = network.getDefaultServerAddress().IPv4;
var port = process.env.PORT || 3333;
var pithPath = "/pith";

var db = new tingodb.Db(process.env.HOME + "/.pith.db", {});

console.log("Listening on " + serverAddress + ":" + port);

var pithApp = new Pith({
    rootUrl: "http://" + serverAddress + ":" + port + pithPath,
    rootPath: pithPath,
    db: db
});

var app = express();

app.use(pithPath, pithApp.handle);
app.use("/rest", rest(pithApp));
app.use("/webui", express.static("webui"));
app.get("/", function(req, res) {
    res.redirect("/webui");
});

app.set("json replacer", function(k,v) {
    if(k.charAt(0) == '_') return undefined;
    else return v;
});

var server = new http.Server(app);

server.listen(port, serverAddress);

var wss = new ws.Server({server: server});

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
