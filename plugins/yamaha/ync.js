var http = require('http'),
    request = require('request'),
    xml2js = require('xml2js');

function YamahaReceiver(ctrlUrl) {
    this.ctrlUrl = ctrlUrl;
}

YamahaReceiver.prototype = {
    invoke: function(rsp, path, param, callback) {
        var p = path.split(/,/).reverse();
        var msg = p.reduce(function(a,b) {
            return "<" + b + ">" + a + "</" + b + ">";
        }, param);

        request({
            url: this.ctrlUrl,
            method: 'POST',
            body: "<YAMAHA_AV cmd=\"" + rsp + "\">" + msg + "</YAMAHA_AV>"
        }, function(err,res,body) {
            xml2js.parseString(body, {explicitArray:false}, function(err, root) {
                if(err) {
                    callback(err);
                    return;
                }

                var r = root.YAMAHA_AV;
                for(var x= p.length-1; x>=0; x--) {
                    r = r[p[x]];
                }
                callback(false, r);
            });
        });
    },

    get: function(path, callback) {
        this.invoke("GET", path, "GetParam", callback);
    },

    put: function(path, param, callback) {
        this.invoke("PUT", path, param, callback);
    }
};

module.exports = YamahaReceiver;