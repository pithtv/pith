import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';

export const DBDriverSymbol = "DBDriver" as InjectionToken<DBDriver>;

export interface DBDriver {
    open(): Promise<void>;
}
