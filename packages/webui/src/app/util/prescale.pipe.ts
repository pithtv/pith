import {Pipe, PipeTransform} from "@angular/core";

@Pipe({name: 'prescale'})
export class PrescalePipe implements PipeTransform {
  transform(value: any, scale: string): any {
    // if(window.devicePixelRatio > 1 && scale.match(/^[0-9]+x[0-9]+$/)) {
    //   scale = scale.split('x').map(s => parseInt(s) * window.devicePixelRatio).join('x');
    // }
    return value && `/scale/${value}?size=${scale}`;
  }
}
