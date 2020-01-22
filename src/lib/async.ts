import async from "async";
import {getLogger} from "log4js";

const logger = getLogger("async");

module.exports = {
    map(array, mapper) {
        return new Promise((resolve, reject) => {
            async.map(array, (item, callback) => {
                if (mapper.length === 1) {
                    Promise.resolve(mapper(item)).then((res) => callback(null, res)).catch(callback);
                } else {
                    mapper(item, callback);
                }
            }, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    async mapSeries(array, mapper) {
        const out = new Array(array.length);
        let idx = 0;
        for (const item of array) {
            out[idx++] = await mapper(item, idx);
        }
        return out;
    },

    queue(worker) {
        const queue = [];
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
            },
        };
    },

    wrap(func) {
        return new Promise((resolve, reject) => {
            func((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });
    },

    wrapNoErr(func) {
        return new Promise((resolve) => {
            func((res) => {
                resolve(res);
            });
        });
    },

    retry(func, interval, timeout) {
        return new Promise((resolve, reject) => {
            const s = new Date().getTime() + timeout;
            const f = () => {
                Promise.resolve(func()).then(resolve)
                    .catch((err) => {

                        if (new Date().getTime() > s) {
                            reject(err);
                        } else {
                            logger.debug("Retrying call...");
                            setTimeout(f, interval);
                        }
                    });
            };
            f();
        });
    },
};
