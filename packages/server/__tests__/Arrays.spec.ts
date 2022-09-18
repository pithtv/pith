import {expect, test} from '@jest/globals';
import * as Arrays from "../src/lib/Arrays";

test("Arrays.max", () => {
   expect(Arrays.max([10, 100, 200, 150, 120], (a,b) => a-b)).toEqual({value: 200, index: 2});
});

test("Arrays.compare", () => {
    expect(Arrays.compare((x: {a: number}) => x.a)({a: 10},  {a: 20})).toEqual(-1);
    expect(Arrays.compare((x: {a: number}) => x.a)({a: 30},  {a: 20})).toEqual(1);
    expect(Arrays.compare((x: {a: number}) => x.a)({a: 30},  {a: 30})).toEqual(0);
})

interface TestObj {
    a: number,
    b: number
}

test("Arrays.chain", () => {
    const chained = Arrays.chain<TestObj>(Arrays.compare(a => a.a), Arrays.compare(a => a.b));
    expect(chained({a: 0, b: 0}, {a: 0, b: 0})).toEqual(0);
    expect(chained({a: 1, b: 0}, {a: 0, b: 0})).toEqual(1);
    expect(chained({a: 1, b: 0}, {a: 2, b: 0})).toEqual(-1);
    expect(chained({a: 1, b: 1}, {a: 2, b: 0})).toEqual(-1);
    expect(chained({a: 1, b: 0}, {a: 2, b: 1})).toEqual(-1);
    expect(chained({a: 2, b: 0}, {a: 2, b: 0})).toEqual(0);
    expect(chained({a: 2, b: 1}, {a: 2, b: 0})).toEqual(1);
    expect(chained({a: 2, b: 1}, {a: 2, b: 2})).toEqual(-1);
})

test("Arrays.reverse", () => {
    expect(Arrays.reverse(() => 1)(0,0)).toEqual(-1);
    expect(Arrays.reverse(() => -1)(0,0)).toEqual(1);
})
