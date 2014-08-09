var os = require("os");

module.exports = {
    getDefaultServerAddress: function() {
        var ni = os.getNetworkInterfaces();
        var addresses = {};
        
        for(var name in ni) {
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
}