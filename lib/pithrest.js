var express = require("express");

module.exports = function(pith) {
    var router = express.Router();
    
    router.use("/channels", function(req, res) {
        pith.listChannels(function(list) {
            res.json(list);
        });
    }).get(/channel\/([^\/]*)\/(.*)$/, function(req, res) {
        var channelId = req.params[0];
        var path = req.params[1];
        pith.listChannel(channelId, path, function(list) {
            res.json(list);
        });
    }).get("/players", function(req,res) {
        pith.listPlayers(function(list) {
            res.json(list);
        });
    }).get(/player\/([^\/]*)\/load\/([^\/]*)\/(.*)$/, function(req, res) {
        var playerId = req.params[0];
        var channelId = req.params[1];
        var itemId = req.params[2];
        console.log(playerId, channelId, itemId);
        pith.loadMedia(channelId, itemId, playerId);
        res.end();
    });
    
    return router;
}