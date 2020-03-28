import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';
import {Collection} from 'mongodb';

export const DBDriverSymbol = "DBDriver" as InjectionToken<DBDriver>;

export interface DBDriver {
    open(): Promise<void>;

    collection(name: string): Collection;
}
