const {Service} = require("./Service");
const {SoapError} = require("../Error");

class ConnectionManager extends Service {
    constructor(device) {
        super({
            SourceProtocolInfo: {value: '', evented: true},
            SinkProtocolInfo: {value: '', evented: true},
            CurrentConnectionIDs: {value: 0, evented: true}
        }, {
            device: device,
            type: 'ConnectionManager',
            serviceDescription: __dirname + '/ConnectionManager.xml',
            optionalActions: ['PrepareForConnection', 'ConnectionComplete'],
            stateActions: {
                GetCurrentConnectionIDs: 'ConnectionIDs'
            }
        });
    }

    actionHandler(action, options, cb) {
        if (this.optionalActions.includes(action)) {
            this.optionalAction(cb);
        }

        if (action in this.stateActions) {
            this.getStateVar(action, this.stateActions[action], cb);
        }

        switch (action) {
            case 'GetProtocolInfo':
                this.makeProtocolInfo(cb);
                break;
            case 'GetCurrentConnectionInfo':
                this.makeConnectionInfo(cb);
                break;
            default:
                cb(null, this.buildSoapError(new SoapError(401)));
        }
    }

    makeProtocolInfo(cb) {
        cb(null, this.buildSoapResponse('GetProtocolInfo', {
            Source: this.stateVars.SourceProtocolInfo,
            Sink: ''
        }));
    }

    makeConnectionInfo(cb) {
        cb(null, this.buildSoapResponse('GetCurrentConnectionInfo', {
            RcsID: -1,
            AVTransportID: -1,
            ProtocolInfo: this.protocols.join(','),
            PeerConnectionManager: '',
            PeerConnectionID: -1,
            Direction: 'Output',
            Status: 'OK'
        }));
    }
}

module.exports = {ConnectionManager};
