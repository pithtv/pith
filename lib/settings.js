var fs = require("fs"),
    path = require("path");

module.exports = {
    loadSettings: function(file, callback) {
        if(!fs.existsSync(file)) {
            var settings = require("./defaults");
            this.storeSettings(file, settings, function() {
               callback(null, settings);
            });
        } else {
            fs.readFile(file, {encoding: 'utf-8'}, function(error, buffer) {
                callback(null, JSON.parse(buffer));
            });
        }
    },
    storeSettings: function(file, settings, callback) {
        var buffer = JSON.stringify(settings);
        fs.writeFile(file, buffer, callback);
    }
};