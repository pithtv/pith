import fs from 'fs';
import defaults from './defaults';
import {assign} from './util';

export function loadSettings(file, callback) {
    if (!fs.existsSync(file)) {
        storeSettings(file, defaults, function () {
            callback(null, defaults);
        });
    } else {
        fs.readFile(file, {encoding: 'utf-8'}, function (error, buffer) {
            const settings = JSON.parse(buffer.toString());
            callback(null, assign({}, defaults, settings));
        });
    }
}

export function storeSettings(file, settings, callback) {
    const buffer = JSON.stringify(settings);
    fs.writeFile(file, buffer, callback);
}
