import {PithClientService, PithSettings} from "../core/pith-client.service";
import {Component} from "@angular/core";
import {Observable} from "rxjs/Observable";

@Component({
  templateUrl: 'settings.component.html'
})
export class SettingsComponent {
  settings: Observable<PithSettings>;

  constructor(private pithClientService: PithClientService) {
    this.settings = this.pithClientService.loadSettings();
  }

  save(settings) {
    this.pithClientService.storeSettings(settings);
  }
}
