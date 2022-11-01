import {Component, Input} from "@angular/core";
import {Settings} from "@pithmediaserver/api";

@Component({
  selector: 'advanced-settings',
  templateUrl: 'advanced-settings.component.html'
})
export class AdvancedSettingsComponent {
  @Input() settings: Settings;
}
