import {PithClientService} from "../core/pith-client.service";
import {Component} from "@angular/core";
import {Observable} from "rxjs";
import {Settings} from "@pithmediaserver/api";

@Component({
  templateUrl: 'settings.component.html'
})
export class SettingsComponent {
  settings: Observable<Settings>;
  active: number;

  constructor(private pithClientService: PithClientService) {
    this.settings = this.pithClientService.loadSettings();
  }

  save(settings) {
    this.pithClientService.storeSettings(settings);
  }
}
