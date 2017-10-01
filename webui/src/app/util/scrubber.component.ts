import {Component, EventEmitter, Input, Output, ViewChild} from "@angular/core";

@Component({
  selector: "scrubber",
  templateUrl: "scrubber.component.html"
})
export class ScrubberComponent {
  @Input("value") value: number;
  @Input("max") max: number;
  @Output("valueChanged") valueChanged:EventEmitter<number> = new EventEmitter();

  @ViewChild("container") container;

  handleSeekClick(event) {
    let targetTime = this.max * event.layerX / this.container.nativeElement.offsetWidth;
    this.valueChanged.emit(targetTime);
  }
}
