import {Pipe, PipeTransform} from "@angular/core";
import {PrescalePipe} from "./prescale.pipe";
import {Image} from "../core/pith-client.service";

@Pipe({name: 'image'})
export class ImagePipe implements PipeTransform {
  prescale = new PrescalePipe();

  transform(value: Image[], {language, size, css}: {language?: string, size?: string, css?: boolean} = {}): string | undefined {
    if(!value) {
      return;
    }
    const candidate = value.find(i => i.language === candidate)
      ?? value.find(i => i.language === 'en')
      ?? value.find(i => !i.language)
      ?? value[0]
    ;
    if(!candidate) return;
    const url = this.prescale.transform(candidate.url, size ?? 'original');
    if(css) {
      return `url(${url})`;
    } else {
      return url;
    }
  }
}
