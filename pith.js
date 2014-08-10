"use strict";

var express = require("express");
var plugin = require("plugin")();
var tingodb = require("tingodb")();
var vidstreamer = require("./lib/vidstreamer");
var events = require("events");

var database = tingodb.Db("~/.pith/database", {});

var route = express.Router();

var sequence = 0;

function newId() {
    return "id"+sequence++;
}

function pith (rootUrl) {
    this.load(rootUrl);
}

pith.prototype = {
    route: route,
    
    channels: [],
    channelMap: {},
    channelInstances: {},
    
    players: [],
    playerMap: {},
    
    getChannelInstance: function (channelId) {
        var channelInstance = this.channelInstances[channelId];
        if (channelInstance === undefined) {
            var channel = this.channelMap[channelId];
            channelInstance = this.channelInstances[channelId] = channel.init(this);
        }
        return channelInstance;
    },
    
    registerChannel: function (channel) {
        this.channels.push(channel);
        this.channelMap[channel.id] = channel;
        this.channels.sort(function (a, b) {
            if (a.sequence === b.sequence) { return 0; }
            else if(a.sequence < b.sequence) return -1;
            else return 1;
        });
        this.emit("channelRegistered", channel);
    },
    
    registerPlayer: function (player) {
        player.id = newId();
        this.players.push(player);
        this.playerMap[player.id] = player;
        this.emit("playerregistered", player);
        var self = this;
        player.on("statechange", function(status) {
            status.serverTimestamp = new Date().getTime();
            self.emit("playerstatechange", player.id, status);
        });
    },
    
    unregisterPlayer: function(player) {
        this.players = this.players.filter(function(e) {
            return e.id !== player.id;
        });
        this.playerMap[player.id] = undefined;
        self.emit("playerdisappeared", player.id);
    },
    
    updatePlayerStates: function() {
        var newTs = new Date().getTime();
        this.players.forEach(function(e) {
            if(e.status.state.playing) {
                var delta = (newTs - e.status.serverTimestamp) / 1000;
                e.status.position.time += delta;
                e.status.serverTimestamp = newTs;
            }
        });
    },
    
    listPlayers: function(cb) {
        this.updatePlayerStates();
        cb(this.players);  
    },
    
    listChannels: function(cb) {
        cb(this.channels);
    },
    
    listChannel: function (channelId, containerId, cb) {
        this.getChannelInstance(channelId).listContents(containerId, cb);
    },
    
    getStream: function (channelId, itemId, cb) {
        var channelInstance = this.getChannelInstance(channelId);
        var item = channelInstance.getItem(itemId);
        var pith = this;
        if(item.isLocal()) {
            channelInstance.getLocalFile(itemId, function(localFile) {
                var itemPath = itemId.split("/").map(encodeURIComponent).join("/");
                cb(pith.rootUrl + "/stream/" + channelId + "/" + itemPath);
            });
        } else {
            channelInstance.getStreamUrl(itemId, cb);
        }
    },
    
    loadMedia: function(channelId, itemId, playerId, cb) {
        var player = this.playerMap[playerId];
        this.getStream(channelId, itemId, function(url) {
            player.load(url, function(err) {
                if(err && err.error) {
                    cb(err);   
                } else {
                    player.play(function(err) {
                        if(err && err.error) {
                            cb(err);
                        } else {
                            cb();
                        }
                    });
                }
            });
        });
    },
    
    controlPlayback: function(playerId, command) {
        var player = this.playerMap[playerId];
        player[command]();
    },
    
    load: function(rootUrl) {
        require("./plugins/files/plugin").plugin().init({pith: this});
        require("./plugins/upnp-mediarenderer/plugin").plugin().init({pith: this});
        this.rootUrl = rootUrl;
        
        var pithApp = this;
        
        vidstreamer.settings({
            getFile: function(path, cb) {
                var i = path.indexOf('/');
                var channelId = path.substring(0, i);
                var itemId = path.substring(i+1);
                pithApp.getChannelInstance(channelId).getLocalFile(itemId, cb);
            }
        });
        
        this.handle.use('/stream', vidstreamer);
    },
    
    handle: route
}

pith.prototype.__proto__ = events.EventEmitter.prototype;

module.exports = pith;