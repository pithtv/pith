import {Component, Injectable} from "@angular/core"
import {PithClientService} from "./core/pith-client.service";

@Component({
  selector: 'pith-logo',
  templateUrl: './pith-logo.component.html'
})
@Injectable()
export class PithLogoComponent {
  loading: any;

  constructor(private pithClientService: PithClientService) {
    pithClientService.progress.subscribe(v => {
      this.loading = v.loading;
    })
  }
}
