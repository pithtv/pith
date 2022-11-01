import {Component, Input} from "@angular/core";
import {Settings} from "@pithmediaserver/api";

@Component({
  selector: 'integration-settings',
  templateUrl: 'integration-settings.component.html'
})
export class IntegrationSettingsComponent {
  @Input('settings') settings: Settings;

  getSonarSettingsUrl() {
    var url = this.settings.sonarr.url;
    if(!url.endsWith('/')) {
      url += '/';
    }
    url += 'settings/general';
    return url;
  }

  getRadarrSettingsUrl() {
    var url = this.settings.radarr.url;
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
