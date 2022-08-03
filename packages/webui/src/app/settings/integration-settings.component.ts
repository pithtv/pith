import {Component, Input} from "@angular/core";
import {PithSettings} from "../core/pith-client.service";

@Component({
  selector: 'integration-settings',
  templateUrl: 'integration-settings.component.html'
})
export class IntegrationSettingsComponent {
  @Input('settings') settings: PithSettings;

  getSonarSettingsUrl() {
    var url = this.settings.sonarr.url;
    if(!url.endsWith('/')) {
      url += '/';
    }
    url += 'settings/general';
    return url;
  }

  getCouchpotatoSettingsUrl() {
    var url = this.settings.couchpotato.url;
    if(!url.endsWith('/')) {
      url += '/';
    }
    url += 'settings/general';
    return url;
  }
}
