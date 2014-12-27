"use strict";

var express = require("express");
var plugin = require("plugin")();
var EventEmitter = require("./lib/events");
var async = require("async");
var global = require("./lib/global")();

var route = express.Router();

var sequence = 0;

function newId() {
    return "id"+(sequence++);
}

function Pith (opts) {
    for(var x in opts) {
        this[x] = opts[x];
    }
    this.load();
}

Pith.prototype = {
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
            channelInstance = this.channelInstances[channelId] = channel.init({pith: this});
            channelInstance.id = channelId;
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
        this.emit("channelRegistered", {channel: channel});
    },
    
    registerPlayer: function (player) {
        if(!player.id) player.id = newId();
        this.players.push(player);
        this.playerMap[player.id] = player;
        this.emit("playerregistered", {player: player});

        var self = this;
        player.on("statechange", function(status) {
            status.serverTimestamp = new Date().getTime();
            self.emit("playerstatechange", {player: player, status: status});
        });
    },
    
    unregisterPlayer: function(player) {
        this.players = this.players.filter(function(e) {
            return e.id !== player.id;
        });
        this.playerMap[player.id] = undefined;
        this.emit("playerdisappeared", {player: player});
    },
    
    updatePlayerStates: function() {
        var newTs = new Date().getTime();
        this.players.forEach(function(e) {
            try {
                if(e.status.state.playing) {
                    var delta = (newTs - e.status.serverTimestamp) / 1000;
                    e.status.position.time += delta;
                    e.status.serverTimestamp = newTs;
                }
            } catch(e) {
                
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
    
    getChannelContentDetail: function (channelId, containerId, cb) {
        this.getChannelInstance(channelId).getItem(containerId, cb);
    },
    
    listChannelContents: function (channelId, containerId, cb, options) {
        var ci = this.getChannelInstance(channelId);
        ci.listContents(containerId, function(err, contents) {
            if(!err && options.includePlayStates) {
                async.map(contents, function(item, m) {
                    ci.getLastPlayState(item.id, function(err, state) {
                        item.playState = state;
                        m(err, item);
                    });
                }, function(err, result) {
                    cb(err, result);
                });
            } else {
                cb(err, contents);
            }
        });
        
    },
    
    getStream: function (channelId, itemId, cb) {
        var channelInstance = this.getChannelInstance(channelId);
        channelInstance.getStream(itemId, cb);
    },
    
    getLastPlayState: function(channelId, itemId, cb) {
        var channelInstance = this.getChannelInstance(channelId);
        channelInstance.getLastPlayState(itemId, cb);
    },
    
    putPlayState: function(channelId, itemId, state, cb) {
        var channelInstance = this.getChannelInstance(channelId);
        if(state.duration > 600) {
            if(!state.status) {
                if(state.time > Math.max(state.duration - 300, state.duration * 11 / 12)) {
                    state.status = 'watched';
                } else {
                    state.status = 'inprogress';
                }
            }
            channelInstance.putPlayState(itemId, state, cb);
        }
    },
    
    loadMedia: function(channelId, itemId, playerId, cb, opts) {
        var self = this;
        var player = this.playerMap[playerId];
        if(!player) {
            cb(new Error("Unknown player", playerId));
            return;
        }
        var channel = self.getChannelInstance(channelId);
        channel.getItem(itemId, function(err, item) {
            player.load(channel, item, function(err) {
                if(err) {
                    cb(err);
                } else {
                    player.play(function(err) {
                        cb(err);
                    }, opts && opts.time);
                }
            });
        });
    },
    
    controlPlayback: function(playerId, command, query, cb) {
        var player = this.playerMap[playerId];
        if(typeof query === 'function') {
            cb = query;
            query = undefined;
        }
        player[command](cb, query);
    },
    
    load: function() {
        require("./plugins/files/plugin").init({pith: this});
        require("./plugins/movies/plugin").init({pith: this});
        require("./plugins/upnp-mediarenderer/plugin").init({pith: this});
        require("./plugins/yamaha/plugin").init({pith: this});
    },

    settings: function(settings) {
        if(arguments.length === 0) {
            return global.settings;
        } else {
            global.storeSettings(settings);
        }
    },
    
    handle: route
};

Pith.prototype.__proto__ = EventEmitter.prototype;

module.exports = Pith;