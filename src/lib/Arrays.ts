export type comparable = string | number;
export type Accessor<T> = (a: T) => comparable;
export type Comparator<T> = (a: T, b: T) => number;

export function compare<T>(acc: Accessor<T>) : Comparator<T> {
    return (a,b) => {
        const vA = acc(a), vB = acc(b);
        if(vA > vB) return 1;
        else if(vA < vB) return -1;
        return 0;
    }
}

export function chain<T>(...comps: Comparator<T>[]) : Comparator<T> {
    return (a,b) => comps.reduce((lastResult: number, comp: Comparator<T>) => {
        if(lastResult === 0) return comp(a,b);
        else return lastResult;
    }, 0);
}

export function reverse<T>(comp: Comparator<T>) : Comparator<T> {
    return (a,b) => -1 * comp(a,b);
}

type ValueAndIndex<T> = {index: number, value: T} | {index: -1, value: undefined};

export function max<T>(arr: T[], comparator: Comparator<T>) : ValueAndIndex<T> {
    return arr.reduce((a: ValueAndIndex<T>,b: T,idx) => {
        if(a.index !== -1 && comparator(a.value,b) > 0) return a;
        return {value: b, index: idx};
    }, {index: -1, value: undefined})
}
