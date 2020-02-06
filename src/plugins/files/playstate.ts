import {IPlayState} from '../../channel';
import {inject, injectable, singleton} from 'tsyringe';
import {DBDriver, DBDriverSymbol} from '../../persistence/DBDriver';
import {initialiser} from '../../lib/AsyncInitialisation';

interface PersistedPlayState extends IPlayState {
    _id;
}

@injectable()
@singleton()
export class StateStore {
    private cache: {[key: string]: PersistedPlayState} = {};
    private queue: PersistedPlayState[] = [];
    private collection: any;

    constructor(@inject(DBDriverSymbol) db: DBDriver) {
        this.collection = db.collection('playstates');
    }

    @initialiser() init() {
        return new Promise((resolve, reject) => {
            this.collection.find({}, (err, cursor) => {
                cursor.each((err, doc) => {
                    if (err) {
                        reject(err);
                    } else if (doc === null) {
                        resolve();
                        this.scheduleFlush();
                    } else {
                        this.cache[doc.id] = doc;
                    }
                });
            });
        });
    }

    get(id) {
        return this.cache[id];
    }

    put(object) {
        const existing = this.get(object.id);
        if (existing) {
            object._id = existing._id;
        }

        this.cache[object.id] = object;

        let x = 0;
        const l = this.queue.length;
        const idx = this.queue.findIndex(q => q.id === object.id);
        if(idx >= 0) {
            this.queue[x] = object;
        } else {
            this.queue.push(object);
        }
    }

    private scheduleFlush() {
        setTimeout(() => {

            const next = () => {
                if (this.queue.length) {
                    const state = this.queue.pop();
                    if (state._id) {
                        this.collection.update({_id: state._id}, state, next);
                    } else {
                        this.collection.insert(state, next);
                    }
                } else {
                    this.scheduleFlush();
                }
            };

            next();

        }, 10000);
    }

}
