"use strict";

const express = require("express");
const EventEmitter = require("./lib/events");
const global = require("./lib/global")();

const route = express.Router();

let sequence = 0;

function newId() {
    return "id"+(sequence++);
}

class Pith extends EventEmitter {
    constructor(opts) {
        super();

        this.route = route;
        this.handle = route;
        this.channels = [];
        this.channelMap = {};
        this.channelInstances = {};

        this.players = [];
        this.playerMap = {};

        Object.assign(this, opts);
        this.load()
    }

    getChannelInstance(channelId) {
        let channelInstance = this.channelInstances[channelId];
        if (channelInstance === undefined) {
            const channel = this.channelMap[channelId];
            if(channel !== undefined) {
                channelInstance = this.channelInstances[channelId] = channel.init({pith: this});
                channelInstance.id = channelId;
            }
        }
        return channelInstance;
    }

    registerChannel(channel) {
        this.channels.push(channel);
        this.channelMap[channel.id] = channel;
        this.channels.sort(function (a, b) {
            if (a.sequence === b.sequence) { return 0; }
            else if(a.sequence < b.sequence) return -1;
            else return 1;
        });
        this.emit("channelRegistered", {channel: channel});
    }

    registerPlayer(player) {
        if(!player.id) player.id = newId();
        this.players.push(player);
        this.playerMap[player.id] = player;
        this.emit("playerregistered", {player: player});

        player.on("statechange", (status) => {
            status.serverTimestamp = new Date().getTime();
            this.emit("playerstatechange", {player: player, status: status});
        });
    }

    unregisterPlayer(player) {
        this.players = this.players.filter(e => e.id !== player.id);
        this.playerMap[player.id] = undefined;
        this.emit("playerdisappeared", {player: player});
    }

    updatePlayerStates() {
        const newTs = new Date().getTime();
        this.players.forEach((e) => {
            if(e.status.state && e.status.state.playing) {
                const delta = (newTs - e.status.serverTimestamp) / 1000;
                e.status.position.time += delta;
                e.status.serverTimestamp = newTs;
            }
        });
    }

    listPlayers(cb) {
        this.updatePlayerStates();
        cb(this.players);
    }

    listChannels(cb) {
        cb(this.channels);
    }

    getLastPlayState(channelId, itemId, cb) {
        const channelInstance = this.getChannelInstance(channelId);
        channelInstance.getLastPlayState(itemId).then(result => cb(false, result)).catch(cb);
    }

    putPlayState(channelId, itemId, state, cb) {
        const channelInstance = this.getChannelInstance(channelId);
        if(channelInstance) {
            if (state.status !== undefined || state.duration > 600) {
                if (!state.status) {
                    if (state.time > Math.max(state.duration - 300, state.duration * 11 / 12)) {
                        state.status = 'watched';
                    } else {
                        state.status = 'inprogress';
                    }
                }
                let promise = channelInstance.putPlayState(itemId, state);
                if (cb) {
                    promise.then(result => cb(false, result)).catch(cb);
                }
            }
        }
    }

    loadMedia(channelId, itemId, playerId, cb, opts) {
        let player = this.playerMap[playerId];
        if(!player) {
            cb(new Error(`Unknown player ${playerId}`));
            return;
        }
        let channel = this.getChannelInstance(channelId);
        channel.getItem(itemId).then((item) => {
            player.load(channel, item, function(err) {
                if(err) {
                    cb(err);
                } else {
                    player.play(function(err) {
                        cb(err);
                    }, opts && opts.time);
                }
            });
        }).catch(err => cb(err));
    }

    controlPlayback(playerId, command, query, cb) {
        const player = this.playerMap[playerId];
        if(typeof query === 'function') {
            cb = query;
            query = undefined;
        }
        player[command](cb, query);
    }

    load() {
        require("./plugins/files/plugin").init({pith: this});
        require("./plugins/library/plugin").init({pith: this});
        require("./plugins/upnp-mediarenderer/plugin").init({pith: this});
        require("./plugins/yamaha/plugin").init({pith: this});
        require("./plugins/sonarr/plugin").init({pith: this});
        require("./plugins/couchpotato/plugin").init({pith: this});
        require("./plugins/upnp-mediaserver/plugin").init({pith: this});
    }

    settings(settings) {
        if(arguments.length === 0) {
            return global.settings;
        } else {
            global.storeSettings(settings);
        }
    }
}

module.exports = Pith;
