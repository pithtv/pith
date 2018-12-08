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
