import {Component, Input} from "@angular/core";
import {PithSettings} from "../core/pith-client.service";

@Component({
  selector: 'library-category-settings',
  templateUrl: 'library-category-settings.component.html'
})
export class LibraryCategorySettingsComponent {
  @Input() settings: PithSettings;
  @Input() type: string;
  @Input() title: string;

  get folders() {
    return this.settings.library.folders.filter(f => f.contains == this.type);
  }
}
