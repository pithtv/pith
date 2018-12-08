const {DeviceControlProtocol} = require("../DeviceControlProtocol");
const { processors, Parser } = require('xml2js');
const gen_uuid = require('node-uuid');
const {HttpError, SoapError} = require("../Error");
const entities = require('entities');
const fs = require('fs');
const url = require('url');
const http = require('http');

function toXml(args) {
    if(typeof args === 'object') {
        return Object.entries(args).map(([key, value]) => `<${key}>${toXml(value)}</${key}>`).join('');
    } else if(typeof args === 'string') {
        return entities.encodeXML(args);
    } else {
        return args.toString();
    }
}

class Service extends DeviceControlProtocol {
    constructor(_stateVars, ...opts) {
        super(...opts);
        this._stateVars = _stateVars;

        this.stateVars = {};

        Object.entries(this._stateVars).forEach(([key, value]) => Object.defineProperty(
            this.stateVars,
            key,
            {
                get: () => this._stateVars[key].value,
                set: (v) => {
                    this._stateVars[key].value = v;
                    if(this._stateVars[key].evented) {
                        this.notify();
                    }
                }
            }
        ));
    }

    // TODO promisify
    action(action, data, cb) {
        new Parser({tagNameProcessors: [processors.stripPrefix]}).parseString(data, (err, data) => {
            if(err) cb(err);
            else this.actionHandler(action, data['Envelope']['Body'][0][action][0], cb);
        });
    }

    // TODO whats this?
    attribute(attr) {
        Object.defineProperty(this.prototype, attr, {
            get() {
                return this.get(attr);
            },
            set(value) {
                let attrs = {};
                attrs[attr] = value;
                this.set(attrs);
            }
        });
    }

    subscribe(urls, reqTimeout) {
        let sid = `uuid:${gen_uuid()}`;
        if(this.subs == null) {
            this.subs = {};
        }
        this.subs[sid] = new Subscription(sid, urls, this);
        let timeout = this.subs[sid].selfDestruct(reqTimeout);
        return {
            sid, timeout: `Second-${timeout}`
        };
    }

    renew(sid, reqTimeout) {
        if(!this.subs[sid]) {
            console.log(`Got subscription renewal request for ${sid} but could not find device`);
            return null;
        }

        let timeout = this.subs[sid].selfDestruct(reqTimeout);
        return {
            sid, timeout: `Second-${timeout}`
        };
    }

    unsubscribe(sid) {
        delete this.subs[sid];
    }

    optionalAction(cb) {
        // TODO what's this? seems error should be first argument anyway?
        cb(null, new SoapError(602));
    }

    // TODO promisify
    getStateVar(action, elName, cb) {
        let varName = /^(Get)?(\w+)$/.exec(action)[2];
        if(varName in this._stateVars) {
            let el = {};
            el[elName] = this.stateVars[varName];
            cb(null, this.buildSoapResponse(action, el));
        } else {
            cb(new SoapError(404));
        }
    }

    notify() {
        Object.values(this.subs).forEach(subscription => subscription.notify());
    }

    buildSoapResponse(action, args) {
        return `<?xml version="1.0"?>
        <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <s:Body>
                <u:${action}Response>
                    ${toXml(args)}
                </u:${action}Response>
            </s:Body>
        </s:Envelope>`;
    }

    buildSoapError(error) {
        return `<?xml version="1.0"?>
        <s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">
            <s:Body>
                <s:Fault>
                    <faultcode>S:Client</faultcode>
                    <faultstring>UPnPError</faultstring>
                    <detail>
                        <UPnPError xmlns:e="${this.makeNS('control')}">
                            <errorCode>${error.code}</errorCode>
                            <errorDescription>${error.message}</errorMessage>
                        </UPnPError>
                    </detail>
                </s:Fault>
            </s:Body>
        </s:Envelope>`;
    }

    buildEvent(vars) {
        return `<?xml version="1.0"?>
        <e:propertyset xmlns:e="${this.makeNS('event')}">
            <e:property>${toXml(vars)}</e:property>
        </e:propertyset>`;
    }

    postEvent(urls, sid, eventKey, data) {
        for(let eventUrl of urls) {
            let u = url.parse(eventUrl);
            let headers = {
                nt: 'upnp:event',
                nts: 'upnp:propchange',
                sid: sid,
                seq: eventKey.toString(),
                'content-length': Buffer.byteLength(data),
                'content-type': null
            };
            let options = {
                host: u.hostname,
                port: u.port,
                method: 'NOTIFY',
                path: u.pathname,
                header: this.device.makeHeaders(headers),
                agent: false
            };
            let req = http.request(options);
            req.on('error', err => console.log(`${eventUrl} - ${err.message}`));
            req.write(data);
            req.end();
        }
    }

    buildServiceElement() {
        return toXml({
            serviceType: this.makeType(),
            eventSubURL: `/service/${this.type}/event`,
            controlURL: `/service/${this.type}/control`,
            SCPDURL: `/service/${this.type}/description`,
            serviceId: `url:upnp-org:serviceId:${this.type}`
        });
    }

    requestHandler({action, req}, cb) {
        switch(action) {
            case 'description':
                fs.readFile(this.serviceDescription, 'utf-8', cb);
                break;
            case 'control':
                let [,serviceAction] = /:\d#(\w+)"$/.exec(req.headers.soapaction);
                if(req.method != 'POST' || !serviceAction) {
                    cb(new HttpError(405));
                    return;
                }
                let data = '';
                req.on('data', chunk => data += chunk);
                req.on('end', () => {
                    this.action(serviceAction, data, (err, soapResponse) => cb(err, soapResponse, {ext: null}));
                });
                break;
            case 'event':
                let {sid, timeout, callback} = req.headers;
                let resp, err;
                if(req.method == 'SUBSCRIBE') {
                    if(callback) {
                        if(/<http/.test(callback)) {
                            resp = this.subscribe(callback.slice(1,-1), timeout);
                        } else {
                            err = new HttpError(412);
                        }
                    } else if(sid) {
                        resp = this.renew(sid, timeout);
                    } else {
                        err = new HttpError(400);
                    }

                    if(!resp) {
                        err = new HttpError(412);
                    }
                    cb(err, null, resp);
                } else if(req.method == 'UNSUBSCRIBE') {
                    if(sid) {
                        this.unsubscribe(sid);
                        cb();
                    } else {
                        cb(new HttpError(412));
                    }
                } else {
                    cb(new HttpError(405));
                }
                break;
            default:
                cb(new HttpError(404));
        }
    }
}

class Subscription {
    constructor(uuid, urls, service) {
        this.uuid = uuid;
        this.service = service;
        this.eventKey = 0;
        this.minTimeout = 1800;
        this.urls = urls.split(',');
        this.notify();
    }

    selfDestruct(timeout) {
        if(this.destructionTimer) {
            clearTimeout(this.destructionTimer)
        }

        let time = /Second-(infinite|\d+)/.exec(timeout)[1];
        if(time == 'infinite' || parseInt(time) > this.minTimeout) {
            time = this.minTimeout;
        } else {
            time = parseInt(time);
        }

        this.destructionTimer = setTimeout(() => this.service.unsubscribe(this.uuid, time * 1000));
        return time;
    }

    notify() {
        let eventedVars = {};
        for(let [key, val] of Object.entries(this.service._stateVars)) {
            if(val.evented) {
                eventedVars[key] = this.service.stateVars[key];
            }
        }
        let eventXml = this.service.buildEvent(eventedVars);
        this.service.postEvent(this.urls, this.uuid, this.eventKey, eventXml);
        this.eventKey++;
    }
}

module.exports = { Service };
