const fs = require("fs"),
    util = require("./util");
const defaults = require("./defaults");

module.exports = {
    loadSettings: function(file, callback) {
        if(!fs.existsSync(file)) {
            this.storeSettings(file, defaults, function() {
               callback(null, defaults);
            });
        } else {
            fs.readFile(file, {encoding: 'utf-8'}, function(error, buffer) {
                const settings = JSON.parse(buffer.toString());
                callback(null, util.assign({}, defaults, settings));
            });
        }
    },
    storeSettings: function(file, settings, callback) {
        const buffer = JSON.stringify(settings);
        fs.writeFile(file, buffer, callback);
    }
};
