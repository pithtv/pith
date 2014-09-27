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
    }).get(/channel\/detail\/([^\/]*)\/(.*)$/, function(req, res) {
        var channelId = req.params[0];
        var path = req.params[1];
        pith.getChannelContentDetail(channelId, path, json.bind(res));
    }).get(/channel\/playstate\/([^\/]*)\/(.*)$/, function(req, res) {
        var channelId = req.params[0];
        var path = req.params[1];
        pith.getLastPlayState(channelId, path, json.bind(res));
    }).put(/channel\/playstate\/([^\/]*)\/(.*)$/, function(req, res) {
        var channelId = req.params[0];
        var path = req.params[1];
        pith.putPlayState(channelId, path, req.body, json.bind(res));
    }).get(/channel\/list\/([^\/]*)\/(.*)$/, function(req, res) {
        var channelId = req.params[0];
        var path = req.params[1];
        pith.listChannelContents(channelId, path, json.bind(res), req.query);
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
    });
    
    return router;
};