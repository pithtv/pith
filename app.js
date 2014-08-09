var Pith = require("./pith.js");
var rest = require("./lib/pithrest.js");
var express = require("express");
var DNode = require("dnode");
var network = require("./lib/network.js");

var serverAddress = network.getDefaultServerAddress();
var port = 3333;
var pithPath = "/pith";

var pithApp = new Pith("http://" + serverAddress.IPv4 + ":" + port + pithPath);

var app = express();

app.use(pithPath, pithApp.handle);
app.use("/rest", rest(pithApp));
app.use("/webui", express.static("webui"));

app.listen(3333);

module.exports = Pith;
