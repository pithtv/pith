import express from 'express';

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
        pith.listPlayers().then(function(list) {
            res.json(list);
        });
    }).get(/player\/([^\/]*)\/load\/([^\/]*)\/(.*)$/, function(req, res) {
        const playerId = req.params[0];
        const channelId = req.params[1];
        const itemId = req.params[2];
        pith.loadMedia(channelId, itemId, playerId, json.bind(res), req.query);
    }).get("/player/:playerId/:command", function(req, res) {
        pith.controlPlayback(req.params.playerId, req.params.command, req.query);
        res.end();
    }).get("/settings", function(req, res) {
        res.json(pith.settings());
    }).put("/settings", function(req, res) {
        pith.settings(req.body);
        res.end();
    });

    return router;
}
