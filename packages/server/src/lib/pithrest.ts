import {SettingsStoreSymbol} from "../settings/SettingsStore";
import {container} from "tsyringe";
import {FastifyPluginAsync} from "fastify";
import {IPlayState, Settings} from "@pithmediaserver/api";
import {Pith} from "../pith";

type ChannelRequestParams = {
    channelId: string,
    "*": string
};

export function pithRest(pith: Pith) : FastifyPluginAsync {
    return async (app, _) => {
        app.get("/channels", () => pith.listChannels())
        app.get<{
            Params: ChannelRequestParams}>("/channel/:channelId/detail/*",
            (req) => {
                return pith.getChannelInstance(req.params.channelId).getItem(req.params["*"])
            })
        app.get<{
            Params: ChannelRequestParams}>("/channel/:channelId/playstate/*",
            (req) => {
                return pith.getChannelInstance(req.params.channelId).getLastPlayState(req.params["*"])
            })
        app.put<{
            Params: ChannelRequestParams, Body: IPlayState}>("/channel/:channelId/playstate/*",
            (req) => {
                return pith.getChannelInstance(req.params.channelId).putPlayState(req.params["*"], req.body)
            })
        app.get<{
            Params: ChannelRequestParams}>("/channel/:channelId/list/*",
            (req) => {
                return pith.getChannelInstance(req.params.channelId).listContents(req.params["*"])
            })
        app.get<{
            Params: ChannelRequestParams}>("/channel/:channelId/stream/*",
            async (req) => {
                const channelInstance = pith.getChannelInstance(req.params.channelId);
                const item = await channelInstance.getItem(req.params["*"])
                const stream = await channelInstance.getStream(item)
                return { item, stream }
            })
        app.get<{
            Params: ChannelRequestParams}>("/channel/:channelId/redirect/*",
            async (req, res) => {
                const channelInstance = pith.getChannelInstance(req.params.channelId);
                const item = await channelInstance.getItem(req.params["*"])
                const stream = await channelInstance.getStream(item)
                res.redirect(stream.url)
            })
        app.get("/players", () => pith.listPlayers())
        app.get<{
            Params: {
                playerId: string,
                channelId: string,
                "*": string,
                time: number
            }}>("/player/:playerId/load/:channelId/*", (req => pith.loadMedia(req.params.channelId, req.params["*"], req.params.playerId, {time: req.params.time})))

        app.get<{Params: {playerId: string}}>("/players/:playerId/stop", (req => pith.getPlayerInstance(req.params.playerId).stop()))
        app.get<{Params: {playerId: string}}>("/players/:playerId/play", (req => pith.getPlayerInstance(req.params.playerId).play()))
        app.get<{Params: {playerId: string}}>("/players/:playerId/pause", (req => pith.getPlayerInstance(req.params.playerId).pause()))
        app.get<{Params: {playerId: string, time: number}}>("/players/:playerId/seek", (req => pith.getPlayerInstance(req.params.playerId).seek({time: req.params.time})))

        app.get("/ribbons", () => pith.listRibbons())
        app.get<{ Params: {ribbonId: string}}>("/ribbons/:ribbonId", (req) => pith.listRibbonContents(req.params.ribbonId))

        app.get("/settings", () => container.resolve(SettingsStoreSymbol).settings)
        app.put<{ Body: Settings }>("/settings", (req) => container.resolve(SettingsStoreSymbol).storeSettings(req.body))
    }
}
