import {Component, Input} from "@angular/core";
import {Channel, ChannelItem} from "../core/pith-client.service";

@Component({
  selector: 'item-other-actions',
  templateUrl: 'item-other-actions.component.html'
})
export class ItemOtherActionsComponent {
  @Input() channel: Channel;
  @Input() item: ChannelItem;
  showVlc: boolean = false;
  
  constructor() {
    if (/android/i.test(navigator.userAgent) || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)) {
      this.showVlc = true;
    }
  }

  togglePlayState() {
    this.channel.togglePlayState(this.item);
  }

  async vlc(action: 'stream'|'download') {
    let stream = await this.channel.stream(this.item.id).toPromise();
    window.location.href = `vlc-x-callback://x-callback-url/${action}?url=${encodeURIComponent(stream.stream.url)}&x-success=${encodeURIComponent(document.location.href)}`;
  }
}
