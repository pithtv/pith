const fs = require("fs");
const xml2js = require("xml2js").parseString;

module.exports = function parseNfo(path, cb) {
        fs.readFile(path, function(err, data) {
            if(err) {
                cb(err);
            } else {
                xml2js(data, function(err, metadata) {
                    const movie = metadata.movie;
                    const result = {};
                    for(let x in movie) {
                        const valueArr = movie[x];
                        const value = (valueArr && valueArr.length === 1) ? valueArr[0] : undefined;

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
