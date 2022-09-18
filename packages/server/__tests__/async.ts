import {expect, test} from '@jest/globals';
import * as async from '../src/lib/async';

test("Map should map", async () => {
    const arr = ["a", "b", "c"];
    const result = await async.map(arr, (x) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(x.toUpperCase());
            }, 100);
        });
    });
    expect(result).toEqual(["A", "B", "C"]);
});

test("MapSeries should map one after the other", async done => {
    const arr = ["a", "b", "c"];
    let alreadyRunning = false;
    const result = await async.mapSeries(arr, (x) => {
        if (alreadyRunning) {
            throw new Error("fail");
        }
        alreadyRunning = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                alreadyRunning = false;
                resolve(x.toUpperCase());
            })
        });
    });
    expect(result).toEqual(["A", "B", "C"]);
    done();
});
