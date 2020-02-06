import test from 'ava';
import * as async from '../lib/async';

test("Map should map", async (t) => {
    const arr = ["a", "b", "c"];
    let result = await async.map(arr, (x) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(x.toUpperCase());
            }, 100);
        });
    });
    t.deepEqual(result, ["A", "B", "C"]);
});

test("MapSeries should map one after the other", async (t) => {
    const arr = ["a", "b", "c"];
    let alreadyRunning = false;
    let result = await async.mapSeries(arr, (x) => {
        if (alreadyRunning) {
            t.fail();
        }
        alreadyRunning = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                alreadyRunning = false;
                resolve(x.toUpperCase());
            })
        });
    });
    t.deepEqual(result, ["A", "B", "C"]);
});
