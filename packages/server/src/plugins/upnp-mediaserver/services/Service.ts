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

import {DeviceControlProtocol} from '../DeviceControlProtocol';
import {Parser, processors} from 'xml2js';
import gen_uuid from 'node-uuid';
import {HttpError, SoapError} from '../Error';
import fs from 'fs';
import url from 'url';
import http from 'http';
import * as async from '../../../lib/async';
import {toXml} from '../../../lib/util';

import {getLogger} from 'log4js';

const logger = getLogger('pith.plugin.upnp-mediaserver.Service');

export abstract class Service extends DeviceControlProtocol {
    stateVars: any;
    private subs: {[key: string]: Subscription};
    private serviceDescription: string;
    protected optionalActions: any[];
    protected stateActions: {[key: string]: string};

    constructor(...opts) {
        super(...opts);

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

    async action(action, data) {
        const parsedData : any = await async.wrap(cb => new Parser({tagNameProcessors: [processors.stripPrefix]}).parseString(data, cb));
        return await this.actionHandler(action, parsedData.Envelope.Body[0][action][0]);
    }

    subscribe(urls, reqTimeout) {
        const sid = `uuid:${gen_uuid()}`;
        if(this.subs == null) {
            this.subs = {};
        }
        this.subs[sid] = new Subscription(sid, urls, this);
        const timeout = this.subs[sid].selfDestruct(reqTimeout);
        return {
            sid, timeout: `Second-${timeout}`
        };
    }

    renew(sid, reqTimeout) {
        if(!this.subs[sid]) {
            logger.log(`Got subscription renewal request for ${sid} but could not find device`);
            return null;
        }

        const timeout = this.subs[sid].selfDestruct(reqTimeout);
        return {
            sid, timeout: `Second-${timeout}`
        };
    }

    unsubscribe(sid, time?: number) {
        delete this.subs[sid];
    }

    async optionalAction() {
        return new SoapError(602);
    }

    async getStateVar(action, elName) {
        const varName = /^(Get)?(\w+)$/.exec(action)[2];
        if(varName in this._stateVars) {
            const el = {};
            el[elName] = this._stateVars[varName].value;
            return this.buildSoapResponse(action, el, this.ns ? `xmlns:u="${this.ns}"` : '');
        } else {
            throw new SoapError(404);
        }
    }

    notify() {
        Object.values(this.subs).forEach(subscription => subscription.notify());
    }

    buildSoapResponse(action: string, args, ns?: string) {
        return `<?xml version="1.0" encoding="UTF-8"?>\n`+
        `<s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">`+
            `<s:Body>`+
                `<u:${action}Response ${ns}>`+
                    toXml(args)+
                `</u:${action}Response>`+
            `</s:Body>`+
        `</s:Envelope>`;
    }

    buildSoapError(error) {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <s:Envelope s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:s="http://schemas.xmlsoap.org/soap/envelope/">
            <s:Body>
                <s:Fault>
                    <faultcode>S:Client</faultcode>
                    <faultstring>UPnPError</faultstring>
                    <detail>
                        <UPnPError xmlns:e="${this.makeNS('control')}">
                            <errorCode>${error.code}</errorCode>
                            <errorDescription>${error.message}</errorDescription>
                        </UPnPError>
                    </detail>
                </s:Fault>
            </s:Body>
        </s:Envelope>`;
    }

    buildEvent(vars) {
        return `<?xml version="1.0" encoding="UTF-8"?>
        <e:propertyset xmlns:e="${this.makeNS('event')}">
            <e:property>${toXml(vars)}</e:property>
        </e:propertyset>`;
    }

    postEvent(urls, sid, eventKey, data) {
        for(const eventUrl of urls) {
            const u = url.parse(eventUrl);
            const headers = {
                nt: 'upnp:event',
                nts: 'upnp:propchange',
                sid,
                seq: eventKey.toString(),
                'content-length': Buffer.byteLength(data),
                'content-type': null
            };
            const options = {
                host: u.hostname,
                port: u.port,
                method: 'NOTIFY',
                path: u.pathname,
                headers: this.device.makeHeaders(headers),
                agent: false
            };
            const req = http.request(options);
            req.on('error', err => logger.error(`${eventUrl} - ${err.message}`));
            req.write(data);
            req.end();
        }
    }

    buildServiceElement() {
        return toXml({
            serviceType: this.makeType(),
            serviceId: `urn:upnp-org:serviceId:${this.type}`,
            SCPDURL: `/service/${this.type}/description`,
            controlURL: `/service/${this.type}/control`,
            eventSubURL: `/service/${this.type}/event`
        });
    }

    async requestHandler({action, req}) {
        switch(action) {
            case 'description':
                return {data: await async.wrap(cb => fs.readFile(this.serviceDescription, 'utf-8', cb))};
            case 'control':
                const [,serviceAction] = /:\d#(\w+)"$/.exec(req.headers.soapaction);
                if(req.method !== 'POST' || !serviceAction) {
                    throw new HttpError(405);
                }
                return new Promise((resolve, reject) => {
                    let data = '';
                    req.on('data', chunk => data += chunk);
                    req.on('end', () => {
                        this.action(serviceAction, data).then(soapResponse =>
                            resolve({data: soapResponse, headers: {ext: null}})
                        ).catch(reject);
                    });
                });
            case 'event':
                const {sid, timeout, callback} = req.headers;
                let resp;
                if(req.method === 'SUBSCRIBE') {
                    if(callback) {
                        if(/<http/.test(callback)) {
                            resp = this.subscribe(callback.slice(1,-1), timeout);
                        } else {
                            throw new HttpError(412);
                        }
                    } else if(sid) {
                        resp = this.renew(sid, timeout);
                    } else {
                        throw new HttpError(400);
                    }

                    if(!resp) {
                        throw new HttpError(412);
                    }
                    return {data: null, headers: resp};
                } else if(req.method === 'UNSUBSCRIBE') {
                    if(sid) {
                        this.unsubscribe(sid);
                        return;
                    } else {
                        throw new HttpError(412);
                    }
                } else {
                    throw new HttpError(405);
                }
            default:
                throw new HttpError(404);
        }
    }

    abstract actionHandler(action: any, parsedDatumElementElementElementElement: any) : Promise<any>;
}

class Subscription {
    private uuid: string;
    private service: Service;
    private eventKey: number;
    private minTimeout: number;
    private urls: string[];
    private destructionTimer: any;

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

        const time = this.parseTimeout(timeout);

        this.destructionTimer = setTimeout(() => this.service.unsubscribe(this.uuid, time * 1000));
        return time;
    }

    private parseTimeout(timeout) : number {
        const time = /Second-(infinite|\d+)/.exec(timeout)[1];
        if (time === 'infinite' || parseInt(time) > this.minTimeout) {
            return this.minTimeout;
        } else {
            return parseInt(time);
        }
    }

    notify() {
        const eventedVars = {};
        for(const [key, val] of Object.entries(this.service._stateVars)) {
            if(val.evented) {
                eventedVars[key] = this.service.stateVars[key];
            }
        }
        const eventXml = this.service.buildEvent(eventedVars);
        this.service.postEvent(this.urls, this.uuid, this.eventKey, eventXml);
        this.eventKey++;
    }
}
