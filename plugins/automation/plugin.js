var global = require("../../lib/global")();

function playerEventHandler(event, data, callback) {

}

module.exports = {
    init: function(opts) {
        var pith = opts.pith;
        pith.on("beforeplay", playerEventHandler.bind("beforeplay"))
            .on("afterstop", playerEventHandler.bind("afterstop"));
    }
};