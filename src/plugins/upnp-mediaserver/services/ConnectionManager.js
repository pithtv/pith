const {Service} = require("./Service");
const {SoapError} = require("../Error");

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

class ConnectionManager extends Service {
    constructor(device) {
        super({
            _stateVars: {
                SourceProtocolInfo: {value: '', evented: true},
                SinkProtocolInfo: {value: '', evented: true},
                CurrentConnectionIDs: {value: 0, evented: true}
            },
            device: device,
            type: 'ConnectionManager',
            serviceDescription: __dirname + '/ConnectionManager.xml',
            optionalActions: ['PrepareForConnection', 'ConnectionComplete'],
            stateActions: {
                GetCurrentConnectionIDs: 'ConnectionIDs'
            }
        });
    }

    async actionHandler(action) {
        if (this.optionalActions.includes(action)) {
            return await this.optionalAction();
        }
        if (action in this.stateActions) {
            return await this.getStateVar(action, this.stateActions[action]);
        }

        try {
            switch (action) {
                case 'GetProtocolInfo':
                    return this.makeProtocolInfo();
                case 'GetCurrentConnectionInfo':
                    return this.makeConnectionInfo();
                default:
                    return this.buildSoapError(new SoapError(401));
            }
        } catch(err) {
            return this.buildSoapError(err);
        }
    }

    makeProtocolInfo() {
        return this.buildSoapResponse('GetProtocolInfo', {
            Source: this.stateVars.SourceProtocolInfo,
            Sink: ''
        });
    }

    makeConnectionInfo() {
        return this.buildSoapResponse('GetCurrentConnectionInfo', {
            RcsID: -1,
            AVTransportID: -1,
            ProtocolInfo: this.protocols.join(','),
            PeerConnectionManager: '',
            PeerConnectionID: -1,
            Direction: 'Output',
            Status: 'OK'
        });
    }
}

module.exports = {ConnectionManager};
