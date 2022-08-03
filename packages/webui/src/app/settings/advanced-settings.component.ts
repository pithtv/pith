import {Component, Input} from "@angular/core";
import {PithSettings} from "../core/pith-client.service";

@Component({
  selector: 'advanced-settings',
  templateUrl: 'advanced-settings.component.html'
})
export class AdvancedSettingsComponent {
  @Input() settings: PithSettings;
}
