/**
 * Based on node-upnp-device:
 * Copyright (c) 2011 Jacob Rask, <http://jacobrask.net>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */

const {Service} = require("./Service");
const {SoapError} = require("../Error");
const {toXml} = require('../../../lib/util');
const entities = require('entities');
const logger = require('log4js').getLogger('pith.plugin.upnp-mediaserver.ContentDirectory');

class ContentDirectory extends Service {
    constructor(device) {
        super({
            _stateVars: {
                SystemUpdateID: {value: 0, evented: true},
                ContainerUpdateIDs: {value: '', evented: true},
                SearchCapabilities: {value: '', evented: false},
                SortCapabilities: {value: '', evented: false}
            },
            device,
            type: 'ContentDirectory',
            serviceDescription: __dirname + '/ContentDirectory.xml',
            optionalActions: [
                'Search',
                'CreateObject',
                'DestroyObject',
                'UpdateObject',
                'ImportResource',
                'ExportResource',
                'StopTransferResource',
                'GetTransferProgress'
            ],
            stateActions: {
                GetSearchCapabilities: 'SearchCaps',
                GetSortCapabilities: 'SortCaps',
                GetSystemUpdateID: 'Id'
            },
            ns: 'urn:schemas-upnp-org:service:ContentDirectory:1'
        });
    }

    async actionHandler(action, options) {
        logger.debug("ContentDirectory received " + action);

        if (this.optionalActions.includes(action)) {
            return await this.optionalAction();
        }
        if (action in this.stateActions) {
            return await this.getStateVar(action, this.stateActions[action]);
        }

        switch (action) {
            case 'Browse':
                try {
                    switch (options.BrowseFlag.toString()) {
                        case 'BrowseMetadata':
                            return await this.browseMetaData(options);
                        case 'BrowseDirectChildren':
                            return await this.browseChildren(options);
                        default:
                            return (new SoapError(402));
                    }
                } catch(err) {
                    logger.error(err);
                    return this.buildSoapError(err);
                }
            default:
                return this.buildSoapError(new SoapError(401));
        }
    }

    async browseChildren(options) {
        let id = (options.ObjectID[0] || 0);
        let start = parseInt(options.StartingIndex || 0);
        let max = parseInt(options.RequestedCount || 0);
        let sort = options.SortCriteria;

        let result = await this.device.delegate.fetchChildren(id, {
            sort, start, max
        });

        let didl = this.buildDidl(result.items);
        return this.buildSoapResponse('Browse', {
            Result: didl,
            NumberReturned: result.items.length,
            TotalMatches: result.totalItems,
            UpdateID: result.updateId
        }, 'xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"');
    }

    async browseMetaData(options) {
        let id = (options.ObjectID[0] || 0);
        let result = await this.device.delegate.fetchObject(id);

        if(!result) {
            logger.error("fetchObject returned no result", options);
            return;
        }

        let didl = this.buildDidl([result.item]);
        logger.debug(didl);
        return this.buildSoapResponse('Browse', {
            Result: didl,
            NumberReturned: 1,
            TotalMatches: 1,
            UpdateID: result.updateId
        }, 'xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"');
    }

    buildDidl(arr) {
        function buildResources(resources) {
            if(resources) {
                return resources.map(r => {
                    if(!r) return '';
                    let x = "<res";
                    if(r.duration) x+= ` duration="${entities.encodeXML(r.duration)}"`;
                    if(r.protocolInfo) x+= ` protocolInfo="${entities.encodeXML(r.protocolInfo)}"`;
                    x += `>${r.uri}</res>`;
                    return x;
                }).join('');
            } else {
                return '';
            }
        }

        function buildItem(object) {
            return `<${object.type} id="${entities.encodeXML(object.id.toString())}" parentID="${entities.encodeXML(object.parentId.toString())}" restricted="1" searchable="0">${toXml(object.properties)}${buildResources(object.resources)}</${object.type}>`;
        }

        return `<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/"
           xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/"
           xmlns:dlna="urn:schemas-dlna-org:metadata-1-0/" xmlns:sec="http://www.sec.co.kr/"
           xmlns:xbmc="urn:schemas-xbmc-org:metadata-1-0/">
           ${arr.map(object => buildItem(object)).join('')}
        </DIDL-Lite>`;
    }
}

module.exports = {ContentDirectory};
