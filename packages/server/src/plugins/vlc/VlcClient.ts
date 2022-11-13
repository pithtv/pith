import {wrap} from "../../lib/async";
import WebSocket from 'ws';
import {EventEmitter} from "events";
import {Icon, IPlayer, IPlayerStatus} from "../../player";
import {IChannel} from "../../channel";
import {getLogger} from "log4js";
import {IChannelItem} from "@pithmediaserver/api";

const logger = getLogger('pith.plugin.VlcClient');

export class VlcClient extends EventEmitter implements IPlayer {
  private webSocket: WebSocket;
  constructor(public readonly address: string, public readonly port: number, public readonly name: string) {
    super();
    this.icons = {
      "48x48": {
        url: "https://code.videolan.org/videolan/vlc/-/raw/b9c656d10309b8c80f932d8017b41495a1035487/share/icons/48x48/vlc.png",
        width: 48,
        height: 48,
        type: "image/png"
      }
    };
    this.friendlyName = name;
  }

  async connect() {
    this.webSocket = new WebSocket(`http://${this.address}:${this.port}`);
    this.webSocket.on('message', (data) => this.processMessage(JSON.parse(data.toString())));
    this.webSocket.on('close', () => this.emit("disconnect"));
    await wrap(cb => this.webSocket.on('open', cb));
    this.send({type: "playing"});
  }

  private send(data: { type: string, [key: string]: any }) {
    logger.debug(`Sending ${JSON.stringify(data)}`);
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
          actions: {play: true, seek: true}
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
          actions: {pause: true, seek: true}
        }
        break;
      default:
        logger.debug(`Unknown message ${JSON.stringify(data)}`);
    }

    this.emit('statechange', this.status);
  }

  status: IPlayerStatus = {position: {time: 0}, actions: {}};
  id: string;
  icons: {[size: string]: Icon};
  friendlyName: string;

  async load(channel: IChannel, item: IChannelItem): Promise<void> {
    const stream = await channel.getStream(item);
    this.send({
      type: "openURL",
      url: stream.url
    });
  }

  async play(seekTime: number|null): Promise<void> {
    if(seekTime === null) {
      this.send({type: "play"});
    } else {
      this.send({type: "play", currentTime: seekTime * 1000});
    }
  }

  async seek({time}: {time: number}): Promise<void> {
    this.send({type: "seekTo", currentTime: time * 1000});
  }

  async pause(): Promise<void> {
    this.send({type: "pause"});
  }
}
