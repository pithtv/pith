import {Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from "@angular/core";

@Directive({
  selector: "[swipeFromLeft]"
})
export class SwipeFromLeftDirective {
  @Input() swipeFromLeft: HTMLElement;
  dragging: boolean;
  @Input() targetExpanded: boolean;
  @Output() targetExpandedChange = new EventEmitter<boolean>();

  @HostListener("touchstart", ['$event.touches[0]','$event']) onTouchStart(touch: Touch, event: TouchEvent) {
    if(touch.clientX < 20 && !this.targetExpanded) {
      this.dragging = true;
      this.swipeFromLeft.classList.add('dragging');
      event.preventDefault();
      event.stopPropagation();
    }
  }

  @HostListener("touchend", ['$event']) onTouchEnd(event: TouchEvent) {
    if(this.dragging) {
      this.dragging = false;
      this.swipeFromLeft.classList.remove('dragging');
      this.swipeFromLeft.style.removeProperty('left');
    }
  }

  @HostListener("touchmove", ['$event.touches[0]']) onTouchMove(event: Touch) {
    if(!this.dragging) {
      return;
    }
    this.swipeFromLeft.style.left = Math.min(0, event.clientX - this.swipeFromLeft.offsetWidth) + 'px';
    let targetValue = event.clientX > this.swipeFromLeft.offsetWidth / 2;
    this.targetExpandedChange.emit(targetValue);
  }
}
