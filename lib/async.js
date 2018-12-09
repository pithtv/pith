const async = require('async');

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

        async function startQueue() {
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

    wrap(func) {
        return new Promise((resolve, reject) => {
            func(function (err, res) {
                if (err) reject(err);
                else resolve(res);
            })
        });
    },

    wrapNoErr(func) {
        return new Promise((resolve, reject) => {
            func(function (res) {
                resolve(res);
            })
        });
    }
};