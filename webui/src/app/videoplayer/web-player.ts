import {Channel, ChannelItem, Player, PlayerStatus} from "../core/pith-client.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export class WebPlayer implements Player {
  icons: object[];
  friendlyName: string;
  private statusSubject = new BehaviorSubject(new PlayerStatus({
    actions: {play: true, pause: true, stop: true}
  }));

  private _stream = new BehaviorSubject(null);

  play() {
    throw new Error("Method not implemented.");
  }

  pause() {
    throw new Error("Method not implemented.");
  }

  stop() {
    throw new Error("Method not implemented.");
  }

  seek(time: number) {
    throw new Error("Method not implemented.");
  }

  load(channel: Channel, item: ChannelItem) {
    channel.stream(item.id, {target: 'hls'}).subscribe(stream => {
      this._stream.next(stream);
    });
  }

  get status() {
    return this.statusSubject.asObservable();
  }

  get activeStream() {
    return this._stream.asObservable();
  }
}
