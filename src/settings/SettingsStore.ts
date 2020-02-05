import {Settings} from './Settings';
import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';

export const SettingsStoreSymbol = "SettingsStore" as InjectionToken<SettingsStore>;

export interface SettingsStore {
    load() : Promise<void>;
    readonly settings : Readonly<Settings>;
    storeSettings(settings: Settings): Promise<void>;
    readonly datadir: string;
}
