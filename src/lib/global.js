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
    let Engine;
    let ObjectId;
    let OpenDatabase;

    switch (loadedSettings.dbEngine) {
        case "tingodb":
            logger.warn("TingoDB support has been removed due to it no longer meeting the necessary requirements. Falling back to MongoDB.");
        case "mongodb":
            Engine = require("mongodb");
            ObjectId = Engine.ObjectID;
            OpenDatabase = function (callback) {
                Engine.MongoClient.connect(loadedSettings.mongoUrl, callback);
            };
            break;
        default:
            throw "Unrecognized dbEngine value " + loadedSettings.dbEngine;
    }

    global = {
        ObjectId: ObjectId,
        OpenDatabase: OpenDatabase,
        bindAddress: loadedSettings.bindAddress || network.getDefaultServerAddress().IPv4,
        httpPort: process.env.PORT || loadedSettings.httpPort
    };

    global.rootUrl = "http://" + global.bindAddress + ":" + global.httpPort;

    while (callbacks.length) {
        callbacks.pop()(false, global);
    }

    return global;
};
