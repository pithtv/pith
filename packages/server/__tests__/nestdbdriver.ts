import {expect, test} from '@jest/globals';
import "reflect-metadata";
import {NestDBDriver} from "../src/persistence/NestDBDriver";

test('Aggregation', async () => {
    const driver = new NestDBDriver(null, ["test"]);
    await driver.open();
    const collection = driver.collection("test");
    await collection.insert([
        {
            episodes: [
                { id: "episode-0", episode: 3, show: 1 },
                { id: "episode-1", episode: 1, show: 1 }
            ]
        },
        {
            episodes: [
                { id: "episode-3", episode: 2, show: 2 }
            ]
        }
    ]);

    const r = await collection.aggregate([
        {$unwind: '$episodes'},
        {$replaceRoot: {newRoot: '$episodes'}},
        {$sort: {'episode': 1}}
    ]).toArray();

    expect(r[0].id).toEqual('episode-1');
    expect(r[1].id).toEqual('episode-3');
    expect(r[2].id).toEqual('episode-0');

    const r2 = await collection.aggregate([
        {$unwind: '$episodes'},
        {$replaceRoot: {newRoot: '$episodes'}},
        {$match: {show: 1}},
        {$sort: {'episode': 1}}
    ]).toArray();

    expect(r2[0].id).toEqual('episode-1');
    expect(r2[1].id).toEqual('episode-0');

})
