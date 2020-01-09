const test = require('ava');
const async = require("../lib/async");

test("Map should map", async (test) => {
    const arr = ["a", "b", "c"];
    let result = await async.map(arr, (x) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(x.toUpperCase());
            }, 100);
        });
    });
    test.deepEqual(result, ["A", "B", "C"]);
});

test("MapSeries should map one after the other", async (test) => {
    const arr = ["a", "b", "c"];
    let alreadyRunning = false;
    let result = await async.mapSeries(arr, (x) => {
        if (alreadyRunning) {
            test.fail();
        }
        alreadyRunning = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                alreadyRunning = false;
                resolve(x.toUpperCase());
            })
        });
    });
    test.deepEqual(result, ["A", "B", "C"]);
});
