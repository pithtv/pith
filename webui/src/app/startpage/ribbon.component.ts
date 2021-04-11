import {Component, Input} from "@angular/core";
import {Channel, PithClientService, Ribbon, RibbonItem} from "../core/pith-client.service";
import {Subscription} from "rxjs";
import {PlayerService} from "../core/player.service";
import {Router} from "@angular/router";

@Component({
  templateUrl: './ribbon.component.html',
  selector: 'ribbon'
})
export class RibbonComponent {
  _ribbon: Ribbon;
  private contents: RibbonItem[];
  private susbcription: Subscription;
  private selectedItem: RibbonItem | undefined;
  private selectedChannel: Channel;

  constructor(private pithClient: PithClientService, private playerService: PlayerService, private router: Router) {

  }

  @Input("ribbon")
  set ribbon(value: Ribbon) {
    this._ribbon = value;
    if(this.susbcription) {
      this.susbcription.unsubscribe();
    }
    this.susbcription = value.listContents().subscribe(contents => this.contents = contents.slice(0, 50));
  }

  select(ribbonItem: RibbonItem) {
    this.pithClient.getChannel(ribbonItem.channelId).first().subscribe(channel => {
      this.selectedItem = ribbonItem;
      this.selectedChannel = channel
    });
  }

  open(ribbonItem: RibbonItem) {
    this.router.navigate(['channel', ribbonItem.channelId, ribbonItem.item.id]);
  }

  async play(ribbonItem: RibbonItem) {
    const player = await this.playerService.activePlayer.toPromise();
    player.loadById(ribbonItem.channelId, ribbonItem.item.id);
  }
}
