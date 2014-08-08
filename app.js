var pith = require("./pith.js");
var express = require("express");
var DNode = require("dnode");

pith.load();

var app = express();

app.use("/pith", pith.handle);
app.use("/webui", express.static("webui"));

app.listen(3333);

DNode(function() {
    
}).listen({
    server: app,
    protocol: 'socket.io',
    transports: ['websocket','xhr-multipart','xhr-polling','htmlfile'],
    path: '/dnode'
});

module.exports = pith;
