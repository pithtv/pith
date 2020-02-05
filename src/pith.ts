import {Router} from "express";
import {IChannel, IChannelInitialiser} from "./channel";
import {EventEmitter} from "./lib/events";
import {IPlayer} from "./player";

const route = Router();

let sequence = 0;

function newId() {
    return "id" + (sequence++);
}

export class Pith extends EventEmitter implements Pith {
    private route: Router;
    public readonly handle: Router;
    private channels: IChannelInitialiser[];
    private channelMap: {[key: string]: IChannelInitialiser};
    private channelInstances: {};
    private players: IPlayer[];
    private playerMap: {[key: string]: IPlayer};
    public readonly rootUrl: string;

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
        this.load();
    }

    public getChannelInstance(channelId): IChannel {
        let channelInstance = this.channelInstances[channelId];
        if (channelInstance === undefined) {
            const channel = this.channelMap[channelId];
            if (channel !== undefined) {
                channelInstance = this.channelInstances[channelId] = channel.init({pith: this});
                channelInstance.id = channelId;
            }
        }
        return channelInstance;
    }

    public registerChannel(channel: IChannelInitialiser) {
        this.channels.push(channel);
        this.channelMap[channel.id] = channel;
        this.channels.sort((a, b) => {
            if (a.sequence === b.sequence) {
                return 0;
            } else if (a.sequence < b.sequence) {
                return -1;
            } else {
                return 1;
            }
        });
        this.emit("channelRegistered", {channel});
    }

    public registerPlayer(player: IPlayer) {
        if (!player.id) {
            player.id = newId();
        }
        this.players.push(player);
        this.playerMap[player.id] = player;
        this.emit("playerregistered", {player});

        player.on("statechange", (status) => {
            status.serverTimestamp = new Date().getTime();
            this.emit("playerstatechange", {player, status});
        });
    }

    public unregisterPlayer(player: IPlayer) {
        this.players = this.players.filter((e) => e.id !== player.id);
        this.playerMap[player.id] = undefined;
        this.emit("playerdisappeared", {player});
    }

    public updatePlayerStates() {
        const newTs = new Date().getTime();
        this.players.forEach((e) => {
            if (e.status.state && e.status.state.playing) {
                const delta = (newTs - e.status.serverTimestamp) / 1000;
                e.status.position.time += delta;
                e.status.serverTimestamp = newTs;
            }
        });
    }

    public listPlayers() {
        this.updatePlayerStates();
        return Promise.resolve(this.players);
    }

    public listChannels() {
        return Promise.resolve(this.channels);
    }

    public getLastPlayState(channelId, itemId, cb) {
        const channelInstance = this.getChannelInstance(channelId);
        channelInstance.getLastPlayState(itemId).then((result) => cb(false, result)).catch(cb);
    }

    public putPlayState(channelId, itemId, state, cb) {
        const channelInstance = this.getChannelInstance(channelId);
        if (channelInstance) {
            if (state.status !== undefined || state.duration > 600) {
                if (!state.status) {
                    if (state.time > Math.max(state.duration - 300, state.duration * 11 / 12)) {
                        state.status = "watched";
                    } else {
                        state.status = "inprogress";
                    }
                }
                const promise = channelInstance.putPlayState(itemId, state);
                if (cb) {
                    promise.then((result) => cb(false, result)).catch(cb);
                }
            }
        }
    }

    public loadMedia(channelId, itemId, playerId, cb, opts) {
        const player = this.playerMap[playerId];
        if (!player) {
            cb(new Error(`Unknown player ${playerId}`));
            return;
        }
        const channel = this.getChannelInstance(channelId);
        channel.getItem(itemId).then(
            (item) => player.load(channel, item),
        ).then(
            () => player.play(opts && opts.time),
        ).then(
            () => cb(false),
        ).catch((err) => cb(err));
    }

    public controlPlayback(playerId, command, query) {
        const player = this.playerMap[playerId];
        return player[command](query);
    }

    public load() {
        require("./plugins/files/plugin").init({pith: this});
        require("./plugins/library/plugin").init({pith: this});
        require("./plugins/upnp-mediarenderer/plugin").init({pith: this});
        require("./plugins/sonarr/plugin").init({pith: this});
        require("./plugins/couchpotato/plugin").init({pith: this});
        require("./plugins/upnp-mediaserver/plugin").init({pith: this});
    }
}
