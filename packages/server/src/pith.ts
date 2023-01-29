// import {Express, Router} from "express";
import {IChannel, IChannelInitialiser} from "./channel";
import {IPlayer} from "./player";
import {container} from 'tsyringe';
import {PluginSymbol} from './plugins/plugins';
import {getLogger} from 'log4js';
import {RibbonOrder} from "./ribbon";
import {flatMap} from "./lib/util";
import {EventEmitter} from "events";
import {Ribbon, RibbonItem} from "@pithmediaserver/api";
import {FastifyInstance} from "fastify";
import {Player} from "@pithmediaserver/api/types/player";

const logger = getLogger("pith");

let sequence = 0;

function newId() {
    return "id" + (sequence++);
}

export class Pith extends EventEmitter {
    private channels: IChannelInitialiser[];
    private channelMap: {[key: string]: IChannelInitialiser};
    private channelInstances: {};
    private players: IPlayer[];
    private playerMap: {[key: string]: IPlayer};
    readonly fastify: FastifyInstance;
    public readonly rootUrl: string;

    constructor(opts = {}) {
        super();

        this.channels = [];
        this.channelMap = {};
        this.channelInstances = {};

        this.players = [];
        this.playerMap = {};

        Object.assign(this, opts);
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
            this.emit("playerstatechange", {
                player: {
                    id: player.id
                },
                status
            });
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
            if (e.status.state && e.status.state.playing && e.status.position) {
                const delta = (newTs - e.status.serverTimestamp) / 1000;
                e.status.position.time += delta;
                e.status.serverTimestamp = newTs;
            }
        });
    }

    public listPlayers() : Promise<Player[]> {
        this.updatePlayerStates();
        return Promise.resolve(this.players.map(player => ({
            id: player.id,
            friendlyName: player.friendlyName,
            status: player.status,
            icons: player.icons
        })));
    }

    public listChannels() : Promise<IChannelInitialiser[]> {
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

    public async loadMedia(channelId, itemId, playerId, opts?: {time: number}) {
        const player = this.playerMap[playerId];
        if (!player) {
            throw new Error(`Unknown player ${playerId}`);
        }
        const channel = this.getChannelInstance(channelId);
        const item = await channel.getItem(itemId)
        await player.load(channel, item)
        await player.play(opts?.time)
    }

    public getPlayerInstance(playerId: string) : IPlayer {
        return this.playerMap[playerId]
    }

    public async load(opts: {
        fastify: FastifyInstance
    }) {
        require("./plugins/files/plugin");
        require("./plugins/library/plugin");
        require("./plugins/upnp-mediarenderer/plugin");
        require("./plugins/sonarr/plugin");
        require("./plugins/radarr/plugin");
        require("./plugins/couchpotato/plugin");
        require("./plugins/upnp-mediaserver/plugin");
        require("./plugins/webui/plugin");
        require("./plugins/vlc/plugin");
        require("./plugins/bonjour/plugin");

        return Promise.all(container.resolveAll(PluginSymbol).map(async plugin => {
            try {
                await plugin.init({...opts, pith: this})
                return plugin
            } catch(e) {
                logger.error(`Error initializing plugin`, e);
            }
        }));
    }

    private async getChannelInstances() : Promise<IChannel[]> {
        return Promise.all(this.channels.map(channelInitialiser => this.getChannelInstance(channelInitialiser.id)));
    }

    public async listRibbons() : Promise<Ribbon[]> {
        const channels = await this.getChannelInstances();
        const allRibbons = await Promise.all(channels.map(channel => channel.getRibbons ? channel.getRibbons() : []));
        const index = allRibbons.reduce((a,b) => a.concat(b), []).reduce<{[key: string]: Ribbon}>(
            (idx, itm) => ({...idx, [itm.id]: itm}), {});
        return Object.values(index);
    }

    public async listRibbonContents(ribbonId: string, maximum: number = 10) : Promise<RibbonItem[]> {
        const channels = await this.getChannelInstances();
        const items = (await Promise.all(
            channels
                .map(async channel =>
                    (channel.listRibbonContents ? ((await channel.listRibbonContents(ribbonId, maximum))??[]).map(item => ({channelId: channel.id, item})) : [])
                ))).reduce(flatMap);
        if(ribbonId in RibbonOrder) {
            items.sort(RibbonOrder[ribbonId]);
        }
        return items.slice(0, maximum);
    }
}
