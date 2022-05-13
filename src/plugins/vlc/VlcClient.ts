import {wrap} from "../../lib/async";
import WebSocket from 'ws';
import {EventEmitter} from "events";
import {Icon, IPlayer, IPlayerStatus} from "../../player";
import {IChannel, IChannelItem} from "../../channel";

export class VlcClient extends EventEmitter implements IPlayer {
  private webSocket: WebSocket;
  constructor(public readonly address: string, public readonly port: number) {
    super();
    this.icons = {
      "48x48": {
        url: "https://code.videolan.org/videolan/vlc/-/raw/b9c656d10309b8c80f932d8017b41495a1035487/share/icons/48x48/vlc.png",
        width: 48,
        height: 48,
        type: "image/png"
      }
    };
    this.friendlyName = "VLC";
  }

  async connect() {
    this.webSocket = new WebSocket(`http://${this.address}:${this.port}`);
    this.webSocket.on('message', (data) => this.processMessage(JSON.parse(data.toString())));
    await wrap(cb => this.webSocket.on('open', cb));
    this.send({type: "playing"});
  }

  private send(data: { type: string, [key: string]: any }) {
    this.webSocket.send(JSON.stringify(data));
  }

  private processMessage(data: any) {
    switch(data.type) {
      case "seekTo":
        this.status = {
          ...this.status,
          position: {
            ...this.status.position,
            time: Math.floor(data.currentTime / 1000)
          }
        };
        break;
      case "play":
        this.status = {
          ...this.status,
          state: {playing: true},
          actions: {pause: true, seek: true}
        };
        break;
      case "pause":
        this.status = {
          ...this.status,
          state: {playing: false},
          actions: {play: true}
        };
        break;
      case "playing":
        this.status = {
          ...this.status,
          position: {
            ...this.status.position,
            title: data.media.title,
            uri: data.media.id,
            duration: Math.floor(data.media.duration / 1000),
            time: Math.floor(data.currentTime / 1000)
          },
          actions: {play: true, seek: true}
        }
    }

    this.emit('statechange', this.status);
  }

  status: IPlayerStatus = {position: {time: 0}, actions: {}};
  id: string;
  icons: {[size: string]: Icon};
  friendlyName: string;

  async load(channel: IChannel, item: IChannelItem): Promise<void> {
    let stream = await channel.getStream(item);
    this.send({
      type: "openURL",
      url: stream.url
    });
  }

  async play(seekTime?: number): Promise<void> {
    if(seekTime === undefined) {
      this.send({type: "play"});
    } else {
      this.send({type: "play", currentTime: seekTime * 1000});
    }
  }
}