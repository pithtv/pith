import {Component, Input} from "@angular/core";
import {Settings} from "@pithmediaserver/api";

@Component({
  selector: 'media-settings',
  templateUrl: 'media-settings.component.html'
})
export class MediaSettingsComponent {
  @Input() settings: Settings;
}
