import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: "scrubber",
  templateUrl: "scrubber.component.html"
})
export class ScrubberComponent {
  @Input("value") value: number;
  @Input("max") max: number;
  @Output("valueChanged") valueChanged:EventEmitter<number> = new EventEmitter();

  handleSeekClick(event) {
    let targetTime = this.max * event.layerX / event.target.offsetWidth;
    this.valueChanged.emit(targetTime);
  }
}
