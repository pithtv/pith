import {Component} from "@angular/core";
import {PithClientService, Ribbon} from "../core/pith-client.service";

@Component({
  templateUrl: './start-page.component.html'
})
export class StartPageComponent {
  ribbons: Ribbon[];

  constructor(private pithClient: PithClientService) {
    pithClient.queryRibbons().subscribe(ribbons => this.ribbons = ribbons);
  }

}
