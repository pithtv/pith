import express from 'express';
import {SettingsStoreSymbol} from "../settings/SettingsStore";
import {container} from "tsyringe";

function json(err, result) {
    if(err) {
        this.status(500);
        this.json(err);
    } else {
        this.json(result);
    }
}

export function handle(pith) {
    const router = express.Router();

    router.use("/channels", function(req, res) {
        pith.listChannels().then(function(list) {
            res.json(list);
        });
    }).use("/channel/:channelId", function(req,res) {
        const channelInstance = pith.getChannelInstance(req.params.channelId);
        channelInstance.route.apply(channelInstance.route, arguments);
    }).get("/players", function(req,res) {
        return pith.listPlayers().then(function(list) {
            res.json(list);
        });
    }).get(/player\/([^\/]*)\/load\/([^\/]*)\/(.*)$/, function(req, res, next) {
        const playerId = req.params[0];
        const channelId = req.params[1];
        const itemId = req.params[2];
        pith.loadMedia(channelId, itemId, playerId, json.bind(res), req.query).catch(next);
    }).get("/player/:playerId/:command", function(req, res, next) {
        pith.controlPlayback(req.params.playerId, req.params.command, req.query).then(() => res.end()).catch(next);
    }).get("/settings", function(req, res) {
        let settingsStore = container.resolve(SettingsStoreSymbol);
        res.json(settingsStore.settings);
    }).put("/settings", function(req, res, next) {
        let settingsStore = container.resolve(SettingsStoreSymbol);
        settingsStore.storeSettings(req.body).then(() => res.end()).catch(next);
    }).get("/ribbons", (req, res, next) => {
        return pith.listRibbons().then(ribbons => res.json(ribbons)).catch(next);
    }).get("/ribbons/:ribbonId", (req, res, next) => {
        return pith.listRibbonContents(req.params.ribbonId).then(contents => res.json(contents)).catch(next);
    });

    return router;
}
