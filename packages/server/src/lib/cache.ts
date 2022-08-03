interface CacheEntry<S, V> {
    signature: S
    value: V | Promise<V>
}

export class AsyncCache<I, S, V> {
    private entryMap : Map<I, CacheEntry<S,V>> = new Map();

    public async resolve(id: I, signature: S, provider: (id: I, signature: S) => Promise<V>) : Promise<V> {
        const cacheEntry = this.entryMap.get(id);
        if(cacheEntry?.signature === signature) {
            return cacheEntry.value;
        } else {
            const valuePromise = provider(id, signature);
            this.entryMap.set(id, {
                signature, value: valuePromise
            });
            try {
                const value = await valuePromise;
                this.entryMap.set(id, {
                    signature, value
                });
                return value;
            } catch(e) {
                this.entryMap.delete(id);
                throw e;
            }
        }
    }

    public isPending(id: I, signature: S) : boolean {
        const entryMap = this.entryMap.get(id);
        if(!entryMap) {
            return false;
        }
        return entryMap.signature === signature && entryMap.value instanceof Promise;
    }

    public isLoaded(id: I, signature: S) : boolean {
        const entryMap = this.entryMap.get(id);
        if(!entryMap) {
            return false;
        }
        return entryMap.signature === signature && !(entryMap.value instanceof Promise);
    }
}
