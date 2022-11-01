import {Component, Input, ViewChild} from "@angular/core";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ContainerChooserComponent} from "./container-chooser.component";
import {Settings} from "@pithmediaserver/api";

@Component({
  selector: 'library-category-settings',
  templateUrl: 'library-category-settings.component.html'
})
export class LibraryCategorySettingsComponent {
  @Input() settings: Settings;

  @ViewChild("confirmDelete", { static: true }) confirmDelete;

  constructor(private modal: NgbModal) {

  }

  addLibraryContainer() {
    this.modal.open(ContainerChooserComponent).result.then(({channel, container}) => {
      this.settings.library.folders.push({
        channelId: channel.id,
        containerId: container.id,
        scanAutomatically: true,
        contains: null
      });
    });
  }

  removeLibraryContainer(container) {
    this.modal.open(this.confirmDelete).result.then(() => {
      this.settings.library.folders.splice(this.settings.library.folders.indexOf(container), 1);
    });
  }
}
