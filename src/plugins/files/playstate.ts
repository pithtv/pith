import {IPlayState} from '../../channel';
import {inject, injectable, singleton} from 'tsyringe';
import {Collection, DBDriver, DBDriverSymbol} from '../../persistence/DBDriver';
import {initialiser} from '../../lib/AsyncInitialisation';

interface PersistedPlayState extends IPlayState {
    _id;
}

@injectable()
@singleton()
export class StateStore {
    private cache: { [key: string]: PersistedPlayState } = {};
    private queue: PersistedPlayState[] = [];
    private collection: Collection<object>;

    constructor(@inject(DBDriverSymbol) db: DBDriver) {
        this.collection = db.collection('playstates');
    }

    @initialiser() async init() {
        const cursor = this.collection.find();
        await cursor.forEach(doc => {
            this.cache[doc.id] = doc;
        });
        this.scheduleFlush();
    }

    get(id: string) {
        return this.cache[id];
    }

    put(object: IPlayState) {
        const existing = this.get(object.id);
        const dbObject = {...existing, ...object};

        this.cache[object.id] = dbObject;

        let x = 0;
        const idx = this.queue.findIndex(q => q.id === object.id);
        if (idx >= 0) {
            this.queue[x] = dbObject;
        } else {
            this.queue.push(dbObject);
        }
    }

    private scheduleFlush() {
        setTimeout(async () => {
            while (this.queue.length) {
                const state = this.queue.pop();
                if (state._id) {
                    await this.collection.updateOne({_id: state._id}, state);
                } else {
                    await this.collection.insertOne(state);
                }
            }
            this.scheduleFlush();
        }, 10000);
    }

}
