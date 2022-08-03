import * as async from '../src/lib/async';

test("Map should map", async () => {
    const arr = ["a", "b", "c"];
    let result = await async.map(arr, (x) => {
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
    let result = await async.mapSeries(arr, (x) => {
        if (alreadyRunning) {
            done.fail();
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
