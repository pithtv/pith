const os = require("os");

module.exports = {
    getDefaultServerAddress: function() {
        const ni = os.networkInterfaces();
        const addresses = {};
        let defaultNi;

        for(let name in ni) {
            if(ni[name][0].internal === false) {
                defaultNi = ni[name];
                break;
            }
        }

        defaultNi.forEach(function(n) {
            addresses[n.family] = n.address;
        });

        return addresses;
    }
};
