import {Channel, ChannelItem, Player, PlayerStatus} from "../core/pith-client.service";
import {BehaviorSubject} from "rxjs";

export class VlcPlayer implements Player {
  icons = {
    "48x48": {url: "./assets/img/vlc.png", local: true}
  };
  friendlyName: string;

  private statusSubject = new BehaviorSubject(new PlayerStatus({
    actions: {play: false, pause: false, stop: false}
  }));

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
    channel.stream(item.id).subscribe(stream => {
      window.location.href = `vlc-x-callback://x-callback-url/stream?url=${encodeURIComponent(stream.stream.url)}&x-success=${encodeURIComponent(document.location.href)}`;
    });
  }

  get status() {
    return this.statusSubject.asObservable();
  }
}
