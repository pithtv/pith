import {Directive, ElementRef, HostListener} from "@angular/core";
import {TimeSeries} from "./timeseries";
import {Momentum} from "./momentum";

@Directive({
  selector: "[syntheticScroll]"
})
export class SyntheticScrollDirective {
  private lastX: number;
  private mouseIsDown: boolean = false;
  private timeSeries: TimeSeries = new TimeSeries(100);
  private animation: Momentum;

  constructor(private element: ElementRef) {
  }

  @HostListener("touchstart", ['$event'])
  touchStart(event: TouchEvent) {
    this.lastX = event.touches[0].pageX;
    this.timeSeries.clear();
    if(this.animation && this.animation.going) {
      event.stopPropagation();
      event.preventDefault();
      this.animation.stop();
    }
  }

  @HostListener("touchmove", ['$event'])
  touchMove(event: TouchEvent) {
    this.moveScroll(this.lastX - event.touches[0].pageX);
    this.lastX = event.touches[0].pageX;
    this.timeSeries.add(event.timeStamp, event.touches[0].pageX);
  }

  @HostListener("touchend", ['$event'])
  touchEnd(event: TouchEvent) {
    let speed = -this.timeSeries.derive();
    if(speed === undefined || isNaN(speed)) {
      return;
    }
    this.animation = new Momentum(speed, 0.995, distance => {
      this.moveScroll(distance);
      return distance > 1;
    });
  }

  @HostListener("mousedown", ['$event'])
  mouseDown(event: MouseEvent) {
    this.lastX = event.pageX;
    this.mouseIsDown = true;
  }

  @HostListener("mouseup", ['$event'])
  mouseUp(event: MouseEvent) {
    this.mouseIsDown = false;
  }

  @HostListener("mousemove", ['$event'])
  mouseMove(event: MouseEvent) {
    if(this.mouseIsDown) {
      let delta = this.lastX - event.pageX;
      this.moveScroll(delta);
      this.lastX = event.pageX;
    }
  }

  @HostListener("mousewheel", ['$event'])
  mouseWheel(event: WheelEvent) {
    this.moveScroll(event.deltaX);
  }

  private getMax() : number {
    return this.element.nativeElement.scrollWidth - this.element.nativeElement.offsetWidth;
  }

  private moveScroll(delta: number) {
    const newValue = Math.min(this.getMax(), Math.max(this.element.nativeElement.scrollLeft + delta, 0));
    this.element.nativeElement.scrollLeft = newValue;
  }
}

