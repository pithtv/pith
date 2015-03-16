var crypto = require("crypto");

module.exports = function(db, callback) {
    function md5(string) {
        var hash = crypto.createHash("md5");
        hash.update(string);
        return hash.digest('hex');
    }

    var collection = db.collection('playstates');
    
    var cache = {};
    var queue = {};
    
    function get(id) {
        return cache[md5(id)];
    }
    
    function put(object) {
        var existing = get(object.id);
        if(existing) {
            object._id = existing._id;
        }
        queue[object.id] = object;
        cache[md5(object.id)] = object;
    }
    
    function scheduleFlush() {
        setTimeout(function() {

            for(var x in queue) {
                var state = queue[x];
                if(state._id) {
                    collection.update({_id: state._id}, state, scheduleFlush);
                } else {
                    collection.insert(state, scheduleFlush);
                }
            }
            queue = {};

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
                cache[md5(doc.id)] = doc;
            }
        });
    });
};