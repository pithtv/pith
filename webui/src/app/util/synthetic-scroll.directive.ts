import {Directive, ElementRef, HostListener} from "@angular/core";

@Directive({
  selector: "[syntheticScroll]"
})
export class SyntheticScrollDirective {
  private lastX: number;
  private mouseIsDown: boolean = false;

  constructor(private element: ElementRef) {
  }

  @HostListener("touchstart", ['$event'])
  touchStart(event: TouchEvent) {
    this.lastX = event.touches[0].pageX;
  }

  @HostListener("touchmove", ['$event'])
  touchMove(event: TouchEvent) {
    this.moveScroll(this.lastX - event.touches[0].pageX);
    this.lastX = event.touches[0].pageX;
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

  private moveScroll(delta: number) {
    let currentScroll = parseInt(this.element.nativeElement.style.marginLeft);
    if(isNaN(currentScroll)) {
      currentScroll = 0;
    }
    this.element.nativeElement.style.marginLeft = Math.max(-(this.element.nativeElement.scrollWidth - this.element.nativeElement.offsetWidth), Math.min(0,currentScroll - delta)) + "px";
  }
}

