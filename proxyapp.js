var express = require("express");
var network = require("./lib/network.js");
var http = require("http");
var request = require("request");
var ws = require("ws");


var serverAddress = network.getDefaultServerAddress();
var port = 3333;
var pithPath = "/pith";

var app = express();

app.use("/webui", express.static("webui"));

app.use("/*", function(req, res){ 
    var options = {
        url: 'http://192.168.1.4:3333' + req.originalUrl,
        method: req.method,
        encoding: null
    };
    
    request(options, function(rreq, rres, data) {
        for(var x in rres.headers) {
            res.setHeader(x, rres.headers[x]);
        }
        res.write(data);
        res.end();
    });
});

var server = http.createServer(app);
server.listen(3333);

module.exports = {};
