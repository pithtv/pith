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

class ContentDirectory extends Service {
    constructor(device) {
        super({
                SystemUpdateID: {value: 0, evented: true},
                ContainerUpdateIDs: {value: '', evented: true},
                SearchCapabilities: {value: '', evented: true},
                SortCapabilities: {values: '', evented: false}
            },
            {
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
                }
            });
    }

    actionHandler(action, options, cb) {
        if (this.optionalActions.includes(action)) {
            return this.optionalAction(cb);
        }
        if (action in this.stateActions) {
            return this.getStateVar(action, this.stateActions[action], cb);
        }

        switch (action) {
            case 'Browse':
                let browseCallback = (err, resp) => cb(null, err ? this.buildSoapError(err) : resp);
                switch (options.BrowseFlag.toString()) {
                    case 'BrowseMetaData':
                        this.browseMetaData(options, browseCallback);
                        break;
                    case 'BrowseDirectChildren':
                        this.browseChildren(options, browseCallback);
                        break;
                    default:
                        browseCallback(new SoapError(402));
                }
                break;
            default:
                cb(null, this.buildSoapError(new SoapError(401)));
        }
    }

    browseChildren(options, cb) {

    }
}

module.exports = {ContentDirectory};
