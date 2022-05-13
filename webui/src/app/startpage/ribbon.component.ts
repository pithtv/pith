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
  contents: RibbonItem[];
  selectedItem: RibbonItem | undefined;
  private subscription: Subscription;

  constructor(private pithClient: PithClientService, private playerService: PlayerService, private router: Router) {

  }

  @Input("ribbon")
  set ribbon(value: Ribbon) {
    this._ribbon = value;
    if(this.subscription) {
      this.subscription.unsubscribe();
    }
    this.subscription = value.listContents().subscribe(contents => this.contents = contents.slice(0, 50));
  }

  @Input("ribbonIndex")
  ribbonIndex: number;

  select(ribbonItem: RibbonItem) {
    setTimeout(() => {
      this.selectedItem = ribbonItem;
    }, 100);
  }

  open(ribbonItem: RibbonItem) {
    this.router.navigate(['channel', ribbonItem.channelId, ribbonItem.item.id]);
  }

  async play(ribbonItem: RibbonItem) {
    const channel = await this.pithClient.getChannel(ribbonItem.channelId).toPromise();
    return this.playerService.load(channel, ribbonItem.item);
  }
}
