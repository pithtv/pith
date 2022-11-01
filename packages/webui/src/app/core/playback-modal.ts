import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {IChannelItem} from "@pithmediaserver/api";

@Component({
  templateUrl: './playback-modal.html',
  selector: 'app-playback-modal'
})
export class PlaybackModalComponent {
  @Input() item: IChannelItem;

  constructor(private modal: NgbActiveModal) {
  }

  resume() {
    this.modal.close({resume: true});
  }

  playFromStart() {
    this.modal.close({resume: false});
  }
}
