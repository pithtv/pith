import {Component} from "@angular/core";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {Channel, ChannelItem, PithClientService} from "../core/pith-client.service";

class State {
  constructor(public channel: Channel, public container: ChannelItem) {}
}

@Component({
  templateUrl: 'container-chooser.component.html'
})
export class ContainerChooserComponent {
  history: State[] = [];
  state: State = new State(null, null);
  limit: number;
  contents: (Channel|ChannelItem)[];
  view: (Channel|ChannelItem)[];

  constructor(private activeModal: NgbActiveModal, private pith: PithClientService) {
    this.refresh();
  }

  go(target: (Channel | ChannelItem)) {
    let state;
    this.history.push(this.state);
    if (target instanceof Channel) {
      state = new State(target, null);
    } else if (target instanceof ChannelItem) {
      state = new State(this.state.channel, target);
    }
    this.state = state;
    this.refresh();
  }

  refresh() {
    if (this.state.channel == null) {
      this.pith.queryChannels().subscribe(channels => {
        this.contents = channels;
        this.refreshView();
      });
    } else {
      this.state.channel.listContents(this.state.container && this.state.container.id).subscribe(contents => {
        this.contents = contents;
        this.refreshView();
      });
    }
    this.limit = 20;
  }

  refreshView() {
    this.view = this.contents.slice(0, this.limit);
  }

  showMore() {
    this.limit *= 20;
    this.refreshView();
  }

  goBack() {
    this.state = this.history.pop();
    this.refresh();
  }

  select(channel: Channel, container: ChannelItem) {
    this.activeModal.close({channel, container});
  }
}
