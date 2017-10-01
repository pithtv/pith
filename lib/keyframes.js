var retrieveKeyframes = require("retrieve-keyframes");

"use strict";

module.exports = function keyframes(path, metadata) {
    return new Promise((resolve, reject) => {
        let formats = metadata.format.format_name.split(/,/);

        if(formats.indexOf('mp4') > -1) {
            retrieveKeyframes.getForMp4(path, (err, frames) => {
                resolve(frames);
            });
        } else if(formats.indexOf('matroska') > -1) {
            retrieveKeyframes.getForMkv(path, (err, frames) => {
                resolve(frames);
            });
        } else {
            reject("Format not supported");
        }
    });
};