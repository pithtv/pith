var async = require('async');

module.exports = {
    map(array, mapper) {
        return new Promise((resolve, reject) => {
            async.map(array, (item, callback) => {
                if (mapper.length == 1) {
                    Promise.resolve(mapper(item)).then(res => callback(null, res)).catch(callback);
                } else {
                    mapper(item, callback);
                }
            }, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        })
    },

    queue(worker) {
        let queue = [];
        let running = false;

        async function startQueue(obj) {
            try {
                running = true;
                while (queue.length) {
                    await worker(queue.shift());
                }
            } finally {
                running = false;
            }
        }

        return {
            async push(obj) {
                queue.push(obj);
                if (!running) {
                    await startQueue();
                }
            }
        }
    },

    wrap(cb) {
        return new Promise((resolve, reject) => {
            cb(function (err, res) {
                if (err) reject(err);
                else resolve(res);
            })
        });
    }
};