import {Component, Input} from "@angular/core";
import {Channel, ChannelItem} from "../core/pith-client.service";

@Component({
  selector: 'channel-details',
  templateUrl: './channel-details.component.html'
})
export class ChannelDetailsComponent {
  @Input() item: ChannelItem;
  @Input() channel: Channel;
}
