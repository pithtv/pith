var async = require("async");
var fs = require("fs");
var parseNfo = require("./parsenfo");
var path = require("path");
var parsefilename = require("../../lib/filenameparser");

function getMetaData(channel, filepath, item, cb) {
    //if(item.mimetype && item.mimetype.match(/^video\//)) {
    //} else {
        cb(item);
    //}
};

module.exports = getMetaData;