import entities from 'entities';
import {promises as fs} from 'fs';
import {parseString as xml2js} from 'xml2js';
import {wrap} from './async';

export type XmlObject = {
    [key: string]: XmlValue
} | {
    _attribs: {
        [key: string]: string | number,
    },
    _value: {
        [key: string]: XmlValue
    }
}

export type XmlValue = string | number | XmlObject | XmlObject[];

export function toXml(args : XmlValue) {
    if (typeof args === 'object') {
        return Object.entries(args).filter(([, value]) => value !== undefined && value !== null).map(([key, value]) => {
            function t(v) {
                if (v === undefined || v === null) {
                    return '';
                }
                let out = `<${key}`;
                if (typeof v === 'object' && ('_attribs' in v)) {
                    out += Object.entries(v._attribs).map(([attribKey, attribValue]) => ` ${attribKey}="${entities.encodeXML(attribValue)}"`).join('');
                }
                out += '>';
                if (typeof v === 'object' && ('_value' in v)) {
                    v = v._value;
                }
                out += toXml(v);
                out += `</${key}>`;
                return out;
            }

            if (Array.isArray(value)) {
                return value.map(t).join('');
            }
            return t(value);
        }).join('');
    } else if (typeof args === 'string') {
        return entities.encodeXML(args);
    } else {
        return args.toString();
    }
}

export async function parseXmlProperties(input: string) : Promise<{[key: string]: string}> {
    const parseResult = await wrap<any>(cb => xml2js(`<?xml version="1.0"?><root>` + input + `</root>`, cb));
    const output = {};
    for(const [key, value] of Object.entries(parseResult.root)) {
        if(key !== '_') {
            output[key] = value[0];
        }
    }
    return output;
}

/**
 * @deprecated Use Object.assign intead
 * @param target
 * @param sources
 */
export function assign(target, ...sources) {
    for (let x = 0; x < sources.length; x++) {
        const source = sources[x];
        const keys = Object.getOwnPropertyNames(source);
        for (let y = 0, l = keys.length; y < l; y++) {
            const key = keys[y];
            const sourceValue = source[key];
            if (sourceValue !== null && sourceValue !== undefined && typeof sourceValue == 'object' && !Array.isArray(sourceValue)) {
                target[key] = this.assign(target[key] || {}, sourceValue);
            } else {
                target[key] = sourceValue;
            }
        }
    }
    return target;
}

export function parseDate(string) {
    if (!string) {
        return string;
    }
    return new Date(Date.parse(string));
}

export async function fileExists(path) {
    try {
        return (await fs.stat(path)).isFile();
    } catch(err) {
        return false;
    }
}

export async function directoryExists(path) {
    try {
        return (await fs.stat(path)).isDirectory();
    } catch(err) {
        return false;
    }
}

export function flatMap<T>(a: T[], b: T[]) : T[] {
    if(a === undefined || a === null) {
        return b;
    }
    if(b === undefined || b === null) {
        return a;
    }
    return a.concat(b);
}
