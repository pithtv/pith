var fs = require("fs"),
    path = require("path"),
    util = require("./util");
var defaults = require("./defaults");

module.exports = {
    loadSettings: function(file, callback) {
        if(!fs.existsSync(file)) {
            this.storeSettings(file, defaults, function() {
               callback(null, defaults);
            });
        } else {
            fs.readFile(file, {encoding: 'utf-8'}, function(error, buffer) {
                var settings = JSON.parse(buffer);
                callback(null, util.assign({}, defaults, settings));
            });
        }
    },
    storeSettings: function(file, settings, callback) {
        var buffer = JSON.stringify(settings);
        fs.writeFile(file, buffer, callback);
    }
};