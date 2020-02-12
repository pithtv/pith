import {getLogger} from 'log4js';
import entities from 'entities';
import {toXml, XmlObject} from './util';

const logger = getLogger('pith.didl');

export namespace didl {
    export interface Resource {
        duration?: string;
        protocolInfo: string;
        uri: string;
    }

    export interface Item {
        type: 'item' | 'container',
        id: number | string,
        parentId: number | string,
        properties: XmlObject,
        resources: Resource[],
        updateId: number
    }
}

export function buildDidlXml(arr: didl.Item[]) {
    function buildResources(resources: didl.Resource[]) {
        if (resources) {
            return resources.map(r => {
                if (!r) {
                    return '';
                }
                let x = '<res';
                if (r.duration) {
                    x += ` duration="${entities.encodeXML(r.duration)}"`;
                }
                if (r.protocolInfo) {
                    x += ` protocolInfo="${entities.encodeXML(r.protocolInfo)}"`;
                }
                x += `>${r.uri}</res>`;
                return x;
            }).join('');
        } else {
            return '';
        }
    }

    function buildItem(object: didl.Item) {
        return `<${object.type} id="${entities.encodeXML(object.id.toString())}" parentID="${entities.encodeXML(object.parentId.toString())}" restricted="1" searchable="0">${toXml(object.properties)}${buildResources(object.resources)}</${object.type}>`;
    }

    return `<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"
           xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
           xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/" xmlns:sec="http://www.sec.co.kr/"
           xmlns:xbmc="urn:schemas-xbmc-org:metadata-1-0/">
           ${arr.map(object => buildItem(object)).join('')}
        </DIDL-Lite>`;
}
