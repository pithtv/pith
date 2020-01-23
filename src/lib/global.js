const network = require("./network");
const fs = require("fs");
const settings = require("./settings");
const path = require("path");
const uuid = require('node-uuid');
const logger = require('log4js').getLogger('pith.global');

let global;
let callbacks = [];

module.exports = function(callback) {
    if(arguments.length === 0) {
        if(global === undefined) {
            throw Error("Synchronous call to Global before init complete");
        }
        return global;
    } else if(global !== undefined) {
        callback(false, global);
    } else {
        if (callbacks.length) {
            callbacks.push(callback);
        } else {
            callbacks = [callback];
            const dataDir = path.resolve(process.env.HOME || process.env.LOCALAPPDATA, ".pith");

            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }

            const settingsFile = path.resolve(dataDir, "settings.json");
            settings.loadSettings(settingsFile, function (err, loadedSettings) {

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

                function persistentUuid(identifier) {
                    if(!loadedSettings.uuid) {
                        loadedSettings.uuid = {};
                    }
                    if(!(identifier in loadedSettings.uuid)) {
                        loadedSettings.uuid[identifier] = uuid();
                        storeSettings();
                    }
                    return loadedSettings.uuid[identifier];
                }

                global = {
                    dataDir: dataDir,
                    settings: loadedSettings,
                    persistentUuid,

                    ObjectId: ObjectId,
                    OpenDatabase: OpenDatabase,

                    bindAddress: loadedSettings.bindAddress || network.getDefaultServerAddress().IPv4,
                    httpPort: process.env.PORT || loadedSettings.httpPort
                };

                global.rootUrl = "http://" + global.bindAddress + ":" + global.httpPort;

                function storeSettings(callback) {
                    settings.storeSettings(settingsFile, loadedSettings, callback || function () {

                    });
                }

                process.on("SIGINT", function() {
                    storeSettings(function() {
                        process.exit(0);
                    });
                });
                process.on("SIGHUP", storeSettings);

                global.storeSettings = function(settings, callback) {
                    global.settings = loadedSettings = settings;
                    storeSettings(callback);
                };

                while(callbacks.length) {
                    callbacks.pop()(false, global);
                }
            });
        }
    }
};
