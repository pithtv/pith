var crypto = require("crypto"),
    async = require("async");

"use strict";

module.exports = function(db, callback) {
    function md5(string) {
        var hash = crypto.createHash("md5");
        hash.update(string);
        return hash.digest('hex');
    }

    var collection = db.collection('playstates');
    
    var cache = {};
    var queue = [];
    
    function get(id) {
        return cache[id];
    }
    
    function put(object) {
        var existing = get(object.id);
        if(existing) {
            object._id = existing._id;
        }

        cache[object.id] = object;

        for(var x= 0,l=queue.length;x<l;x++) {
            if(queue[x].id == object.id) {
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
                    var state = queue.pop();
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
    
    var playstate = {
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