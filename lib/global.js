var network = require("./network");
var fs = require("fs");
var settings = require("./settings");
var path = require("path");

var global = false;
var callbacks = [];

module.exports = function(callback) {
    if(arguments.length == 0) {
        if(global === false) {
            throw Error("Synchronous call to Global before init complete");
        }
        return global;
    } else if(global !== false) {
        callback(false, global);
    } else {
        if (callbacks.length) {
            callbacks.push(callback);
        } else {
            callbacks = [callback];
            var dataDir = path.resolve(process.env.HOME || process.env.LOCALAPPDATA, ".pith");

            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }

            var settingsFile = path.resolve(dataDir, "settings.json");
            settings.loadSettings(settingsFile, function (err, loadedSettings) {

                var Engine;
                var ObjectId;
                var OpenDatabase;

                switch (loadedSettings.dbEngine) {
                    case "mongodb":
                        Engine = require("mongodb");
                        ObjectId = Engine.ObjectID;
                        OpenDatabase = function (callback) {
                            Engine.MongoClient.connect(loadedSettings.mongoUrl, callback);
                        };
                        break;
                    case "tingodb":
                        var dbPath = path.resolve(dataDir, loadedSettings.tingoPath);
                        if(!fs.existsSync(dbPath)) {
                            fs.mkdirSync(dbPath);
                        }
                        Engine = require("tingodb")();
                        ObjectId = Engine.ObjectID;
                        OpenDatabase = function (callback) {
                            var db = new Engine.Db(dbPath, {});
                            callback(null, db);
                        };
                        break;
                    default:
                        throw "Unrecognized dbEngine value " + loadedSettings.dbEngine;
                }

                global = {
                    dataDir: dataDir,
                    settings: loadedSettings,

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