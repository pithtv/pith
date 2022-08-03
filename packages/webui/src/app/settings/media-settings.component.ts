import {Component, Input} from "@angular/core";
import {PithSettings} from "../core/pith-client.service";

@Component({
  selector: 'media-settings',
  templateUrl: 'media-settings.component.html'
})
export class MediaSettingsComponent {
  @Input() settings: PithSettings;
}
