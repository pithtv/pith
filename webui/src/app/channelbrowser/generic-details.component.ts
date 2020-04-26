import {Component, Input} from "@angular/core";
import {Channel, ChannelItem} from "../core/pith-client.service";
import {PlayerService} from "../core/player.service";

@Component({
  selector: 'channel-details',
  templateUrl: './generic-details.component.html'
})
export class GenericDetailsComponent {
  item: ChannelItem;
  channel: Channel;

  constructor(private playerService: PlayerService) {}

  @Input()
  set channelAndItem({channel, item}: {channel: Channel, item: ChannelItem}) {
    this.channel = channel;
    this.item = item;
  }

  load() {
    this.playerService.load(this.channel, this.item);
  }

  togglePlayState() {
    this.channel.togglePlayState(this.item);
  }
}
