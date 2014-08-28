var fs = require("fs");
var xml2js = require("xml2js").parseString;

module.exports = function parseNfo(path, cb) {
        fs.readFile(path, function(err, data) {
            if(err) {
                cb(err);
            } else {
                xml2js(data, function(err, metadata) {
                    var movie = metadata.movie;
                    var result = {};
                    for(var x in movie) {
                        var valueArr = movie[x];
                        var value = (valueArr && valueArr.length == 1) ? valueArr[0] : undefined;
                        
                        switch(x) {
                            case "title":
                            case "year":
                            case "rating":
                            case "plot":
                            case "tagline":
                            case "studio":
                                result[x] = value;
                                break;
                            case "genre":
                                result.genre = value.split(/ ?\/ ?/g);
                                break;
                        }
                    }
                    
                    cb(undefined, result);
                });
            }
        });
    };