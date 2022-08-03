import {AggregationCursor, AggregationOp, Collection, Cursor, DBDriver, isMatch, isReplaceRootOp, isSortOp, isUnwind} from './DBDriver';
import {inject, injectable, singleton} from 'tsyringe';
import {SettingsStore} from '../settings/SettingsStore';
import {getLogger} from 'log4js';
import Datastore from 'nestdb';
import model from 'nestdb/lib/model';
import * as path from "path";
import {wrap} from "../lib/async";

const logger = getLogger("peristence.nestdb");

function enhanceCursor<T = any>(cursor): Cursor<T> {
    return {
        sort(...args) {
            return enhanceCursor(cursor.sort(...args));
        },
        limit(...args) {
            return enhanceCursor(cursor.limit(...args));
        },
        forEach<T>(consumer: (document: T) => void) {
            return new Promise((resolve, reject) => {
                cursor.exec((err, docs) => {
                    if (err) {
                        reject(err);
                    } else {
                        docs.forEach(consumer);
                        resolve(null);
                    }
                });
            });
        },
        toArray<T>(): Promise<T[]> {
            return new Promise((resolve, reject) => {
                cursor.exec((err, docs) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(docs);
                    }
                });
            });
        }
    };
}

function fieldPath(path) {
    if (!path.match(/^\$[a-zA-Z][a-zA-Z]*$/)) {
        throw new Error("Path should start with $");
    }
    return path.substr(1);
}

@injectable()
@singleton()
export class NestDBDriver implements DBDriver {
    private readonly collections = new Map<string, Datastore>();

    constructor(@inject("SettingsStore") private settingsStore: SettingsStore, private collectionNames: string[] = ["genres", "keywords", "movies", "people", "playstates", "series"]) {
    }

    async open() {
        await Promise.all(this.collectionNames.map(name => this.openCollection(name)));
    }

    async openCollection(name: string) {
        logger.info("Opening collection %s", name);
        const datastore = new Datastore(this.settingsStore && {filename: path.resolve(this.settingsStore.datadir, `${name}.nestdb`)});
        try {
            await wrap(cb => datastore.load(cb));
            this.collections.set(name, datastore);
        } catch (err) {
            logger.error("Error opening collection %s: %s", name, err);
            process.exit(1);
        }
    }

    collection(name: string): Collection<any> {
        const datastore: Datastore = this.collections.get(name);
        return {
            find<T>(...args) {
                let cursor = datastore.find(...args);
                return enhanceCursor(cursor);
            },
            async findOne<T>(...args) {
                return (await this.find(...args).toArray())[0];
            },
            async insert<T>(...args) {
                return new Promise((resolve, reject) => {
                    datastore.insert(...args, (err, i) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({insertedCount: i.length, ops: i});
                        }
                    });
                });
            },
            async insertOne<T>(...args) {
                return this.insert(...args);
            },
            updateOne(selector: object, document: object): Promise<{ matchedCount: number }> {
                return new Promise((resolve, reject) => {
                    datastore.update(selector, document, (err, i) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({matchedCount: i.numAffected});
                        }
                    });
                });
            },
            aggregate(pipeline: AggregationOp[]): AggregationCursor {
                const result = this.find().toArray().then((result) => pipeline.reduce((data, operation) => {
                    if (isUnwind(operation)) {
                        const path = fieldPath(operation.$unwind);
                        return data.map(r => (r[path] ?? []).map(v => ({
                            ...r,
                            [path]: v
                        }))).reduce((a,b) => a.concat(b), []);
                    } else if(isMatch(operation)) {
                        return data.filter(r => model.match(r, operation.$match));
                    } else if(isReplaceRootOp(operation)) {
                        const path = fieldPath(operation.$replaceRoot.newRoot);
                        return data.map(r => r[path]);
                    } else if(isSortOp(operation)) {
                        const e = Object.entries(operation.$sort) as [string, number][];
                        return data.sort((a,b) => {
                            return e.reduce((p, [property, direction]) => {
                                if(p === 0) {
                                    return model.compareThings(a[property], b[property]) * direction
                                } else {
                                    return 0;
                                }
                            }, 0);
                        });
                    }
                }, result));
                return {
                    toArray(): Promise<object[]> {
                        return result;
                    }
                }
            }
        }
    }
}
