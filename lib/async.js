var async = require('async');

module.exports = {
    map(array, mapper) {
        return new Promise((resolve, reject) => {
            async.map(array, (item, callback) => {
                if(mapper.length == 1) {
                    Promise.resolve(mapper(item)).then(res => callback(null, res)).catch(callback);
                } else {
                    mapper(item, callback);
                }
            }, (err, result) => {
                if(err) reject(err);
                else resolve(result);
            });
        })
    }
};