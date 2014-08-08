var express = require("express");
var plugin = require("plugin")();
var tingodb = require("tingodb")();

var database = tingodb.Db("~/.pith/database", {});

var route = express.Router();

var pith = {
    route: route,
    
    channels: [],
    
    listen: function(port) {
        this.expressApp.listen(port);
    },
    
    registerChannel: function(channel) {
        this.channels.push(channel);
        this.channels.sort(function(a,b) {
            if(a.sequence == b.sequence) return 0;
            else if(a.sequence < b.sequence) return -1;
            else return 1;
        });
    },
    
    listChannels: function(cb) {
        cb(this.channels);
    },
    
    load: function() {
        require("./plugins/files/plugin").plugin().init({pith: this});
    },
    
    handle: route
}

module.exports = pith;