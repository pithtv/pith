import {expect, test, jest} from '@jest/globals';
import { batch } from '../src/lib/batcher';

test('batch', async () => {
    const items = [1, 2, 3, 4, 5];
    const batchSize = 2;
    const batches = [] as number[][];
    const result = await batch(items, batchSize, async (batch) => {
        batches.push(batch);
        return batch.map(x => x * 2);
    });
    expect(result).toEqual([2, 4, 6, 8, 10]);
    expect(batches).toEqual([[1, 2], [3, 4], [5]]);
});