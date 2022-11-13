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

import {Service} from './Service';
import {getLogger} from 'log4js';
import {SoapError} from '../Error';
import {buildDidlXml} from '../../../lib/didl';
import {parseXmlProperties} from '../../../lib/util';

const logger = getLogger('pith.plugin.upnp-mediaserver.ContentDirectory');

export class ContentDirectory extends Service {
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
            serviceDescription: __dirname + '/../../../../resources/ContentDirectory.xml',
            optionalActions: [
                'Search',
                'CreateObject',
                'DestroyObject',
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
        logger.debug("ContentDirectory received " + action, options);

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
            case 'UpdateObject':
                try {
                    return await this.updateObject(options);
                } catch(err) {
                    logger.error(err);
                    return this.buildSoapError(err);
                }
            default:
                return this.buildSoapError(new SoapError(401));
        }
    }

    async browseChildren(options) {
        const id = (options.ObjectID[0] || 0);
        const start = parseInt(options.StartingIndex || 0, 10);
        const max = parseInt(options.RequestedCount || 0, 10);
        const sort = options.SortCriteria;

        const result = await this.device.delegate.fetchChildren(id, {
            sort, start, max
        });

        const didl = buildDidlXml(result.items);
        return this.buildSoapResponse('Browse', {
            Result: didl,
            NumberReturned: result.items.length,
            TotalMatches: result.totalItems,
            UpdateID: result.updateId
        }, 'xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"');
    }

    async browseMetaData(options) {
        const id = (options.ObjectID[0] || 0);
        const result = await this.device.delegate.fetchObject(id);

        if(!result) {
            logger.warn(`browseMetaData requested for ObjectId '${id}', but no object found`);
            return this.buildSoapError(new SoapError(404));
        }

        const didl = buildDidlXml([result.item]);
        return this.buildSoapResponse('Browse', {
            Result: didl,
            NumberReturned: 1,
            TotalMatches: 1,
            UpdateID: result.updateId
        }, 'xmlns:u="urn:schemas-upnp-org:service:ContentDirectory:1"');
    }

    async updateObject(options) {
        const id = decodeURIComponent(options.ObjectID[0] || 0);
        const currentTagValue = await parseXmlProperties(options.CurrentTagValue);
        const newTagValue = await parseXmlProperties(options.NewTagValue);
        return await this.device.delegate.updateObject(id, currentTagValue, newTagValue);
    }
}
