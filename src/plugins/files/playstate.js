const crypto = require("crypto"),
    async = require("async");

"use strict";

module.exports = function(db, callback) {
    const collection = db.collection('playstates');

    const cache = {};
    const queue = [];

    function get(id) {
        return cache[id];
    }

    function put(object) {
        const existing = get(object.id);
        if(existing) {
            object._id = existing._id;
        }

        cache[object.id] = object;

        let x = 0;
        const l = queue.length;
        for(; x<l; x++) {
            if(queue[x].id === object.id) {
                queue[x] = object;
                return;
            }
        }
        queue.push(object);
    }

    function scheduleFlush() {
        setTimeout(function() {

            function next() {
                if(queue.length) {
                    const state = queue.pop();
                    if(state._id) {
                        collection.update({_id: state._id}, state, next);
                    } else {
                        collection.insert(state, next);
                    }
                } else {
                    scheduleFlush();
                }
            }

            next();

        }, 10000);
    }

    const playstate = {
        get: get,
        put: put
    };

    collection.find({}, function(err, cursor) {
        cursor.each(function(err, doc) {
            if(err) {
                callback(err);
            } else if(doc === null) {
                callback(false, playstate);
                scheduleFlush();
            } else {
                cache[doc.id] = doc;
            }
        });
    });
};
