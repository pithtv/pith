import {Component, Input} from "@angular/core";
import {Channel, ChannelItem} from "../core/pith-client.service";
import {PlayerService} from "../core/player.service";

@Component({
  selector: 'item-actions',
  templateUrl: 'item-actions.component.html'
})
export class ItemActionsComponent {
  @Input() item: ChannelItem;
  @Input() channel: Channel;

  constructor(private playerService: PlayerService) {

  }

  load() {
    this.playerService.load(this.channel, this.item);
  }
}
