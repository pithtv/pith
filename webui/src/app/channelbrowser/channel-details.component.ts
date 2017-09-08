import {Component, Input} from "@angular/core";
import {Channel, ChannelItem} from "../core/pith-client.service";
import {PlayerService} from "../core/player.service";

@Component({
  selector: 'channel-details',
  templateUrl: './channel-details.component.html'
})
export class ChannelDetailsComponent {
  @Input() item: ChannelItem;
  @Input() channel: Channel;

  constructor(private playerService: PlayerService) {}

  load() {
    this.playerService.load(this.channel, this.item);
  }

  togglePlayState() {
    this.channel.togglePlayState(this.item);
  }
}
