import {Collection, DBDriver} from "./DBDriver";
import {inject, injectable, singleton} from "tsyringe";
import {SettingsStore} from "../settings/SettingsStore";
import {NestDBDriver} from "./NestDBDriver";
import {MongoDBDriver} from "./MongoDBDriver";

@injectable()
@singleton()
export class SwitchingDBDriver implements DBDriver {
    private delegate: DBDriver;

    constructor(@inject("SettingsStore") private settingsStore: SettingsStore,
                @inject(NestDBDriver) private nestDbDriver: NestDBDriver,
                @inject(MongoDBDriver) private mongoDbDriver: MongoDBDriver) {
    }

    collection(name: string): Collection<object> {
        return this.delegate.collection(name);
    }

    open(): Promise<void> {
        switch(this.settingsStore.settings.dbEngine) {
            case "mongodb": this.delegate = this.mongoDbDriver; break;
            case "nestdb": this.delegate = this.nestDbDriver; break;
        }
        return this.delegate.open();
    }
}
