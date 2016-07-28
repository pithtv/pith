var metadata = require("./metadata.tmdb.js");
var async = require("async");
var winston = require("winston");
var global = require("../../lib/global")();
var Channel = require("../../lib/channel");
var filenameparser = require("../../lib/filenameparser");

module.exports = function(opts) {
    var db = opts.db;
    return {
        scan: function (channelInstance, dir, cb) {
            "use strict";

            function listContents(container, done) {
                if (container) {
                    channelInstance.listContents(container && container.id, function (err, contents) {
                        if (err) {
                            winston.error(err);
                            done(err);
                        } else if (contents && contents.length) {
                            async.eachSeries(contents, function (item, cb) {
                                if (item.type == 'container') {
                                    listContents(item, cb);
                                } else if (item.playable && item.mimetype.match(/^video\//)) {
                                    db.findMovieByOriginalId(dir.channelId, item.id, function (err, result) {
                                        if(err) {
                                          winston.error(err);
                                          done(err);
                                        } else if (!result) {
                                            winston.info("Found new item " + item.id);

                                            item.modificationTime = container.modificationTime;
                                            item.creationTime = container.creationTime;

                                            var store = function(result) {
                                                winston.info(result.title, result.year);
                                                result.originalId = item.id;
                                                result.channelId = dir.channelId;
                                                result.id = item.id;
                                                result.dateScanned = new Date();
                                                db.storeMovie(result, function (err) {
                                                    cb();
                                                });
                                            }

                                            metadata(item, 'movie', function (err, result) {
                                                if (err) {
                                                    var md = filenameparser(container.title, 'movie');
                                                    if(md) {
                                                        item.title = md.title;
                                                        item.year = md.year;
                                                    } else {
                                                        item.title = container.title;
                                                    }
                                                    metadata(item, 'movie', function (err, result) {
                                                        if (err) {
                                                            cb();
                                                        }
                                                        else store(result);
                                                    });
                                                } else {
                                                    store(result);
                                                }
                                            });
                                        } else {
                                            cb();
                                        }
                                    });
                                } else {
                                    cb();
                                }
                            }, done);
                        } else {
                            done();
                        }
                    });
                }
            }

            channelInstance.getItem(dir.containerId, function (err, container) {
                listContents(container, cb);
            });
        }
    }
};