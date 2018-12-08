const {Device} = require("./Device");
const {ConnectionManager} = require('./services/ConnectionManager');
const {ContentDirectory} = require('./services/ContentDirectory');

class MediaServer extends Device {
    constructor(...opts) {
        super({
            serviceTypes: ['ConnectionManager', 'ContentDirectory'],
            serviceReferences: {
                ConnectionManager,
                ContentDirectory
            },
            type: "MediaServer",
            version: 1
        }, ...opts);
    }
}

module.exports = {MediaServer};
