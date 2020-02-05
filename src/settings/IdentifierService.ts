import {inject, injectable} from 'tsyringe';
import {SettingsStore} from './SettingsStore';
import uuid from 'node-uuid';

@injectable()
export class IdentifierService {
    constructor(@inject("SettingsStore") private settingsStore: SettingsStore) {

    }

    async get(key: string): Promise<string> {
        const settings = await this.settingsStore.settings;
        if(!(key in settings.uuid)) {
            const newUuid = uuid();
            await this.settingsStore.storeSettings({
                ...settings,
                uuid: {
                    ...settings.uuid,
                    [key]: newUuid
                }
            });
            return newUuid;
        } else {
            return settings.uuid[key];
        }
    }
}
