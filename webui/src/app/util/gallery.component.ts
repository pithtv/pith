import {Component, ContentChild, ContentChildren, Input, TemplateRef} from "@angular/core";
import {element} from "protractor";

@Component({
  templateUrl: './gallery.component.html',
  selector: 'gallery'
})
export class GalleryComponent {
  @Input() items: object[];
  @ContentChild(TemplateRef) templ;
  @ContentChildren('cells') cells;
  private expandedItem: any;
  private expandedId: string;
  private showDetailsId: string;
  private showDetails: boolean;

  private cellFor(id: string) {
    if(!id) return null;
    return this.cells.find(cell => cell.getAttribute('cell-id') == id);
  }

  createToggleFunction(item) {
    return () => {
      if(this.showDetailsId == item.id) {
        this.showDetailsId = null;
        this.expandedId = null;
        this.expandedItem = null;
        this.showDetails = false;
      } else {
        let previousCell = this.cellFor(this.expandedId);
        let nextCell = this.cellFor(item.id);

        if(!previousCell || previousCell.offsetTop != nextCell.offsetTop) {
          this.expandedId = item.id;
        }

        this.showDetailsId = item.id;
        this.showDetails = true;
      }
    }
  }
}
