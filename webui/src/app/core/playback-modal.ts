import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {ChannelItem} from './pith-client.service';

@Component({
  templateUrl: './playback-modal.html',
  selector: 'app-playback-modal'
})
export class PlaybackModalComponent {
  @Input() item: ChannelItem;

  constructor(private modal: NgbActiveModal) {
  }

  resume() {
    this.modal.close({resume: true});
  }

  playFromStart() {
    this.modal.close({resume: false});
  }
}
