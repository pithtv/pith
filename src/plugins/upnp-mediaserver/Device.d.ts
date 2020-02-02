import {DeviceControlProtocol} from './DeviceControlProtocol';

export class Device extends DeviceControlProtocol {
    delegate: any; // TODO typing

    makeHeaders(headers: {[key: string]: string|number});

}
