import async from 'async';
import {getLogger} from 'log4js';
import {CallbackWithErrorAndArg} from '../junk';

const logger = getLogger('async');

export function map(array, mapper) {
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
}

export async function mapSeries<I,O>(array: I[], mapper: (value: I, idx: number) => Promise<O>) : Promise<O[]> {
    const out = new Array(array.length);
    let idx = 0;
    for (const item of array) {
        out[idx++] = await mapper(item, idx);
    }
    return out;
}

export interface Queue<T> {
    push(obj: T): Promise<void>;
}

export function queue<T>(worker: (obj: T) => Promise<void>) : Queue<T> {
    const q = [];
    let running = false;

    async function startQueue() {
        try {
            running = true;
            while (q.length) {
                await worker(q.shift());
            }
        } finally {
            running = false;
        }
    }

    return {
        async push(obj) {
            q.push(obj);
            if (!running) {
                await startQueue();
            }
        },
    };
}

export function wrap(func: (cb: () => void) => void): Promise<void>;
export function wrap<R>(func: (cb: CallbackWithErrorAndArg<R>) => void) : Promise<R>;
export function wrap(func) {
    return new Promise((resolve, reject) => {
        func((err, res) => {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

export function wrapNoErr(func) {
    return new Promise((resolve) => {
        func((res) => {
            resolve(res);
        });
    });
}

export function retry(func, interval, timeout) {
    return new Promise((resolve, reject) => {
        const s = new Date().getTime() + timeout;
        const f = () => {
            Promise.resolve(func()).then(resolve)
                .catch((err) => {

                    if (new Date().getTime() > s) {
                        reject(err);
                    } else {
                        logger.debug('Retrying call...');
                        setTimeout(f, interval);
                    }
                });
        };
        f();
    });
}
