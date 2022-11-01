import {Component, Input} from "@angular/core";
import {Channel} from "../core/pith-client.service";
import {PlayerService} from "../core/player.service";
import {IChannelItem} from "@pithmediaserver/api";

@Component({
  selector: 'item-actions',
  templateUrl: 'item-actions.component.html'
})
export class ItemActionsComponent {
  @Input() item: IChannelItem;
  @Input() channel: Channel;

  constructor(private playerService: PlayerService) {

  }

  load() {
    this.playerService.load(this.channel, this.item);
  }
}
