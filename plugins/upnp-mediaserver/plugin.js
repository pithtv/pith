const {MediaServer} = require("./MediaServer");

const Global = require("../../lib/global")();

module.exports = {
    init(opts) {
        let mediaserver = new MediaServer({name: 'MediaServer', address: Global.bindAddress});
        mediaserver.on('ready', () => {
            mediaserver.ssdpAnnounce();
        })
    }
};