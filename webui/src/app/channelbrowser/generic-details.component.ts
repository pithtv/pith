import {Component, Input} from "@angular/core";
import {Channel, ChannelItem} from "../core/pith-client.service";
import {PlayerService} from "../core/player.service";
import {Path} from "./details.component";

@Component({
  selector: 'channel-details',
  templateUrl: './generic-details.component.html'
})
export class GenericDetailsComponent {
  item: ChannelItem;
  channel: Channel;
  path: Path;

  constructor(private playerService: PlayerService) {}

  @Input()
  set channelAndItem({channel, item, path}: {channel: Channel, item: ChannelItem, path: Path}) {
    this.channel = channel;
    this.item = item;
    this.path = [...path, item];
  }

  load() {
    this.playerService.load(this.channel, this.item);
  }

  togglePlayState() {
    this.channel.togglePlayState(this.item);
  }
}
