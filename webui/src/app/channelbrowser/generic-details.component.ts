import {Component, Input} from "@angular/core";
import {Channel, ChannelItem, Stream} from "../core/pith-client.service";
import {PlayerService} from "../core/player.service";
import {Path} from "./details.component";

const resolutionMap  : [number, number, string][]= [
  [1920, 1920, '1080'],
  [1280, 1280, '720'],
  [720, 720, '480'],
  [1998, 2048, '2K'],
  [3840, 4096, '4K'],
  [7680, 8192, '8K']
];

@Component({
  selector: 'channel-details',
  templateUrl: './generic-details.component.html'
})
export class GenericDetailsComponent {
  item: ChannelItem;
  channel: Channel;
  path: Path;
  private stream: Stream;
  private flags: { domain: string, subdomain: string, value: string }[];

  constructor(private playerService: PlayerService) {
  }

  @Input()
  set channelAndItem({channel, item, path}: { channel: Channel, item: ChannelItem, path: Path }) {
    this.channel = channel;
    this.item = item;
    this.path = [...path, item];
    this.channel.stream(item.id).subscribe(({stream}) => {
      this.stream = stream;
      const flags = {};
      const tag = (...args: string[]) => {
        if (args.findIndex(f => !f) === -1) {
          flags[args.join(':')] = true;
        }
      };
      stream.format.streams.forEach(s => {
        switch (s.type) {
          case 'audio':
            tag('audio', 'codec', s.codec);
            tag('audio', 'language', s.language);
            tag('audio', 'channelLayout', s.layout);
            break;
          case 'video':
            tag('video', 'codec', s.codec);
            if(s.resolution?.width) {
              const m = resolutionMap.find(([lowerBound, upperBound]) => s.resolution.width >= lowerBound && s.resolution.width <= upperBound);
              tag('video','resolution', m[2] || `${s.resolution.width}x${s.resolution.height}`);
            }
            break;
          case "subtitle":
            tag('subtitle', 'language', s.language);
            break;
        }
      });
      this.flags = Object.keys(flags).map(flag => {
        const [domain, subdomain, value] = flag.split(':');
        return {domain, subdomain, value};
      });
    });
  }

  load() {
    this.playerService.load(this.channel, this.item);
  }

  togglePlayState() {
    this.channel.togglePlayState(this.item);
  }
}
