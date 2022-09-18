import {AsyncCache} from "../src/lib/cache";
import {expect, test, jest} from '@jest/globals';

interface TestIf {
    id: string,
    signature: number
}

class Deferred<T> {
    public resolve: (value: T) => void;
    readonly promise: Promise<T>;
    constructor() {
        this.promise = new Promise<T>((resolve, reject) => this.resolve = resolve);
    }
}

test("It doesn't launch a second provider while the previous one is still pending", async () => {
    const cache = new AsyncCache<string, number, TestIf>();

    let invocations = 0;

    function provider(id, signature) {
        invocations++;
        return {id, signature};
    }

    expect(cache.isPending("a", 0)).toBeFalsy();
    expect(cache.isLoaded("a", 0)).toBeFalsy();

    const a0_deferred = new Deferred<TestIf>();
    const a0_provider = jest.fn(() => a0_deferred.promise);
    const a0_cachePromise_1 = cache.resolve("a", 0, a0_provider);
    const a0_cachePromise_2 = cache.resolve("a", 0, a0_provider);

    expect(a0_provider).toHaveBeenCalledTimes(1);

    expect(cache.isPending("a", 0)).toBeTruthy();
    expect(cache.isLoaded("a", 0)).toBeFalsy();

    a0_deferred.resolve(provider("a", 0));

    expect(await a0_cachePromise_1).toEqual({id: "a", signature: 0});
    expect(await a0_cachePromise_2).toEqual({id: "a", signature: 0});

    expect(cache.isPending("a", 0)).toBeFalsy();
    expect(cache.isLoaded("a", 0)).toBeTruthy();

})

test("It doesn't launch a second provider if a previous one was resolved", async () => {
    const cache = new AsyncCache<string, number, TestIf>();

    let invocations = 0;

    function provider(id, signature) {
        invocations++;
        return {id, signature};
    }

    expect(cache.isPending("a", 0)).toBeFalsy();
    expect(cache.isLoaded("a", 0)).toBeFalsy();

    const a0_deferred = new Deferred<TestIf>();
    const a0_provider = jest.fn(() => a0_deferred.promise);
    const a0_cachePromise_1 = cache.resolve("a", 0, a0_provider);

    expect(cache.isPending("a", 0)).toBeTruthy();
    expect(cache.isLoaded("a", 0)).toBeFalsy();

    a0_deferred.resolve(provider("a", 0));

    expect(await a0_cachePromise_1).toEqual({id: "a", signature: 0});

    const a0_cachePromise_2 = cache.resolve("a", 0, a0_provider);

    expect(await a0_cachePromise_2).toEqual({id: "a", signature: 0});

    expect(cache.isPending("a", 0)).toBeFalsy();
    expect(cache.isLoaded("a", 0)).toBeTruthy();
    expect(a0_provider).toHaveBeenCalledTimes(1);
})

test("It resolves a new instance if the signature doesn't match", async () => {
    const cache = new AsyncCache<string, number, TestIf>();

    const provider = jest.fn((id, signature) => Promise.resolve({id, signature} as TestIf));

    const result_1 = await cache.resolve("a", 0, provider);
    expect(result_1).toEqual({id: "a", signature: 0});
    expect(provider).toHaveBeenCalledTimes(1);
    expect(provider).toHaveBeenLastCalledWith("a", 0);

    const result_2 = await cache.resolve("a", 0, provider);
    expect(result_2).toEqual({id: "a", signature: 0});
    expect(provider).toHaveBeenCalledTimes(1);

    const result_3 = await cache.resolve("a", 1, provider);
    expect(result_3).toEqual({id: "a", signature: 1});
    expect(provider).toHaveBeenCalledTimes(2);

    const result_4 = await cache.resolve("a", 1, provider);
    expect(result_4).toEqual({id: "a", signature: 1});
    expect(provider).toHaveBeenCalledTimes(2);
    expect(provider).toHaveBeenLastCalledWith("a", 1);
})

test("It differentiates between ids", async () => {
    const cache = new AsyncCache<string, number, TestIf>();
    const provider = jest.fn((id, signature) => Promise.resolve({id, signature} as TestIf));

    const result_1 = await cache.resolve("a", 0, provider);
    expect(result_1).toEqual({id: "a", signature: 0});
    expect(provider).toHaveBeenCalledTimes(1);
    expect(provider).toHaveBeenCalledWith("a", 0);

    const result_2 = await cache.resolve("b", 0, provider);
    expect(result_2).toEqual({id: "b", signature: 0});
    expect(provider).toHaveBeenCalledTimes(2);
    expect(provider).toHaveBeenCalledWith("b", 0);

    const result_3 = await cache.resolve("a", 0, provider);
    expect(result_3).toEqual({id: "a", signature: 0});
    expect(provider).toHaveBeenCalledTimes(2);
    expect(provider).toHaveBeenCalledWith("b", 0);
})
