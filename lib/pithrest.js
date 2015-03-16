var express = require("express");

function json(err, result) {
    if(err) {
        this.status(500);
        this.json(err);
    } else {
        this.json(result);
    }
}

module.exports = function(pith) {
    var router = express.Router();
    
    router.use("/channels", function(req, res) {
        pith.listChannels(function(list) {
            res.json(list);
        });
    }).use("/channel/:channelId", function(req,res) {
        var channelInstance = pith.getChannelInstance(req.params.channelId);
        channelInstance.route.apply(channelInstance.route, arguments);
    }).get("/players", function(req,res) {
        pith.listPlayers(function(list) {
            res.json(list);
        });
    }).get(/player\/([^\/]*)\/load\/([^\/]*)\/(.*)$/, function(req, res) {
        var playerId = req.params[0];
        var channelId = req.params[1];
        var itemId = req.params[2];
        console.log(playerId, channelId, itemId);
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
};