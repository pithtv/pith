var settings = {
    dbEngine: "mongodb", // can be mongodb or tingodb
    mongoUrl: "mongodb://localhost:27017/pith",
    httpPort: 3333, // port the HTTP service will be bound to
    bindAddress: null, // address to bind the HTTP service as well as the UPnP stuff to. null indicates we'll look for an IP to bind to in the available network interfaces
    
    pithContext: "/pith",
    webUiContext: "/webui",
    apiContext: "/rest",
    
    dataDir: process.env.HOME + "/.pith"
};

var network = require("./network");
var fs = require("fs");

if(!fs.existsSync(settings.dataDir)) {
    fs.mkdirSync(settings.dataDir);
}

var Engine;
var ObjectId;
var OpenDatabase;
switch(settings.dbEngine) {
    case "mongodb":
        Engine = require("mongodb");
        ObjectId = Engine.ObjectID;
        OpenDatabase = function(callback) {
            Engine.MongoClient.connect(settings.mongoUrl, callback);
        };
        break;
    case "tingodb":
        Engine = require("tingodb")();
        ObjectId = Engine.ObjectID;
        OpenDatabase = function(callback) {
            var db = new Engine.Db(settings.tingoPath, {});
            callback(db);
        };
        break;
    default:
        throw "Unrecognized dbEngine value " + settings.dbEngine;
}

module.exports = {
    settings: settings,
    
    ObjectId: ObjectId,
    OpenDatabase: OpenDatabase,
    
    bindAddress: settings.bindAddress || network.getDefaultServerAddress().IPv4,
    httpPort: process.env.PORT || settings.httpPort
};
    
module.exports.rootUrl = "http://" + module.exports.bindAddress + ":" + module.exports.httpPort;