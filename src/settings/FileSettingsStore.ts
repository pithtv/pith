import {SettingsStore} from './SettingsStore';
import {Settings} from './Settings';
import path = require('path');
import {promises as fs} from "fs";
import defaults from './defaults';

export class FileSettingsStore implements SettingsStore {

    readonly datadir: string;
    private readonly settingsPath: string;
    private _settings: Settings;

    constructor() {
        this.datadir = process.env.PITH_DATA_DIR || path.resolve(process.env.HOME || process.env.LOCALAPPDATA, ".pith");
        this.settingsPath = path.resolve(this.datadir, "settings.json");
    }

    async load(): Promise<void> {
        const dataDirStat = await fs.stat(this.datadir);
        if(!dataDirStat.isDirectory()) {
            await fs.mkdir(this.datadir);
        }

        const settingsFileStat = await fs.stat(this.settingsPath);
        if(!settingsFileStat.isFile()) {
            this.storeSettings(defaults);
        } else {
           const content = await fs.readFile(this.settingsPath, {encoding: 'utf-8'});
           this._settings = JSON.parse(content.toString());
        }
    }

    get settings() {
        if(!this._settings) {
            throw new Error("Attempt to read settings before SettingsStore is initialized");
        }
        return this._settings;
    }

    storeSettings(settings: Settings): Promise<void> {
        this._settings = settings;
        const buffer = JSON.stringify(settings);
        return fs.writeFile(this.settingsPath, buffer);
    }
}
