import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';

export const DBDriverSymbol = "DBDriver" as InjectionToken<DBDriver>;

export type withId<T> = T & {_id: string | {toHexString(): string}}

export type AggregationUnwindOp = { $unwind: string };
export type AggregationMatchOp = { $match: object };
export type AggregationReplaceRootOp = { $replaceRoot: { newRoot: string } };
export type AggregationSortOp = { $sort: object };
export type AggregationOp = AggregationUnwindOp | AggregationMatchOp | AggregationReplaceRootOp | AggregationSortOp;

export function isUnwind(op: AggregationOp) : op is AggregationUnwindOp {
    return ((op as AggregationUnwindOp).$unwind) !== undefined;
}

export function isMatch(op: AggregationOp) : op is AggregationMatchOp {
    return ((op as AggregationMatchOp).$match) !== undefined;
}

export function isReplaceRootOp(op: AggregationOp) : op is AggregationReplaceRootOp {
    return ((op as AggregationReplaceRootOp).$replaceRoot) !== undefined;
}

export function isSortOp(op: AggregationOp) : op is AggregationSortOp {
    return ((op as AggregationSortOp).$sort) !== undefined;
}

export interface Cursor<T> {
    toArray() : Promise<T[]>
    forEach(consumer: (T) => void) : Promise<void>
    sort(opts: any): Cursor<T>
    limit(opts: any): Cursor<T>
}

export interface AggregationCursor {
    toArray() : Promise<any[]>;
}

export interface Collection<T, Tw = withId<T>> {
    find(filter?: any, opts?: any): Cursor<Tw>;
    findOne(filter?: any): Promise<Tw>;
    insert(docOrDocs: T | T[]) : Promise<{ops: Tw[], insertedCount: number}>
    insertOne(doc: T) : Promise<{ops: Tw[], insertedCount: number}>
    updateOne(selector: object, document: object): Promise<{ matchedCount: number }>
    aggregate(pipeline: AggregationOp[]) : AggregationCursor
}

export interface DBDriver {
    open(): Promise<void>;

    collection(name: string): Collection<object>;
}
