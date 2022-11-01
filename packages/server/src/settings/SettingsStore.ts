import InjectionToken from 'tsyringe/dist/typings/providers/injection-token';
import {Settings} from "@pithmediaserver/api/types/settings";

export const SettingsStoreSymbol = "SettingsStore" as InjectionToken<SettingsStore>;

export interface SettingsStore {
    load() : Promise<void>;
    readonly settings : Readonly<Settings>;
    storeSettings(settings: Settings): Promise<void>;
    readonly datadir: string;
}
