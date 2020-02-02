import {CallbackWithErrorAndArg} from '../../junk';

export interface PositionInfo {
    TrackMetaData?: string;
    TrackDuration: string;
    TrackURI: string;
    RelTime: string;
    AbsTime: string;
    RelCount: number;
    AbsCount: number;
    Track: any;
}

export interface AVTransport {

    GetPositionInfo(param: { InstanceID: number }, cb: CallbackWithErrorAndArg<PositionInfo>);

    SetAVTransportURI(param: { InstanceID: number; CurrentURI: string; CurrentURIMetaData: any }, cb: CallbackWithErrorAndArg<unknown>): void;

    Play(param: { Speed: number; InstanceID: number }, cb: CallbackWithErrorAndArg<unknown>): any;

    Stop(param: { InstanceID: number }, cb: CallbackWithErrorAndArg<unknown>): any;

    Pause(param: { InstanceID: number }, cb: CallbackWithErrorAndArg<unknown>): any;

    Seek(param: { Target: any; InstanceID: number; Unit: string }, cb: CallbackWithErrorAndArg<unknown>): any;

    on(eventName: string, handler: (changeEvent) => void): void;
}
