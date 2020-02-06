const network = require("./network");
const logger = require('log4js').getLogger('pith.global');
const {container} = require('tsyringe');

let global;
let callbacks = [];

module.exports = function() {
    if(global) {
        return global;
    }

    const settingsStore = container.resolve("SettingsStore");
    const loadedSettings = settingsStore.settings;

    global = {
        bindAddress: loadedSettings.bindAddress || network.getDefaultServerAddress().IPv4,
        httpPort: process.env.PORT || loadedSettings.httpPort
    };

    global.rootUrl = "http://" + global.bindAddress + ":" + global.httpPort;

    while (callbacks.length) {
        callbacks.pop()(false, global);
    }

    return global;
};
