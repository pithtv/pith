import {Pipe, PipeTransform} from "@angular/core";
import {sprintf} from "sprintf-js";

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
  transform(value: number): string {
    if(value === undefined) {
      return "-:--";
    } else {
      return sprintf("%d:%02d:%02d", value/3600, (value/60)%60, value%60);
    }
  }
}
