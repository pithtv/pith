import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from "@angular/core";

@Directive({
  selector: '[swipeOut]'
})
export class SwipeOutDirective {
  @Input() swipeOut: boolean;
  @Output() swipeOutChange = new EventEmitter<boolean>();
  private startX: number;
  private previousX: number;

  constructor(private el: ElementRef) {

  }

  @HostListener('touchstart', ['$event']) onTouchStart(event: TouchEvent) {
    this.startX = this.previousX = event.touches[0].clientX;
    this.el.nativeElement.classList.add('dragging');
  }

  @HostListener('touchend', ['$event']) onTouchEnd(event: TouchEvent) {
    this.el.nativeElement.classList.remove('dragging');
    this.el.nativeElement.style.removeProperty('left');
  }

  @HostListener('touchmove', ['$event']) onTouchMove(event: TouchEvent) {
    this.el.nativeElement.style.left = Math.min(0, event.touches[0].clientX - this.startX) + 'px';
    this.swipeOutChange.emit(this.previousX < (this.previousX = event.touches[0].clientX));
    event.preventDefault();
    event.stopPropagation();
  }
}
