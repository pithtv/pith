import {Component, ViewChildren} from "@angular/core";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Channel, ChannelItem, PithClientService} from "../core/pith-client.service";
import 'rxjs/Rx';
import {animate, state, style, transition, trigger} from "@angular/animations";

const animationTiming = "500ms ease";

@Component({
  templateUrl: './channel-browser.component.html',
  animations: [
    trigger('expand',
      [
        state('expanded', style({"margin-bottom": '392px'})),
        state('collapsed', style({"margin-bottom": '0'})),
        transition('expanded => collapsed, collapsed => expanded', animate(animationTiming))
      ]),
    trigger('visibility',
      [
        state('expanded', style({'height': '*'})),
        state('collapsed', style({'height': '0', display: 'none'})),
        transition('expanded => collapsed, collapsed => expanded', animate(animationTiming))
      ])
  ]
})
export class ChannelBrowserComponent {
  showDetailsItem: ChannelItem;
  private channel: Channel;
  private currentPath: string;
  private contents: ChannelItem[];

  private expandedId: string;
  private showDetailsId: string;
  private showDetails: boolean;

  @ViewChildren('cell') cells;

  constructor(private route: ActivatedRoute,
              private pithClient: PithClientService) {
  }

  fetchContents() {
    this.channel.listContents(this.currentPath).subscribe(contents => this.contents = contents);
  }

  ngOnInit() {
    this.route.paramMap.switchMap((params: ParamMap) => {
      let id = params.get('id');
      return this.pithClient.getChannel(id);
    }).subscribe((channel: Channel) => {
      this.channel = channel;
      this.currentPath = "";
      this.fetchContents();
    });
  }

  cellFor(id: string) {
    if(!id) return null;
    return this.cells.find(cell => {
      return cell.nativeElement.id == id
    });
  }

  toggle(item: ChannelItem) {
      if(this.showDetailsId == item.id) {
        this.showDetailsId = null;
        // this.expandedId = null;
        this.showDetails = false;
      } else {
        let previousCell = this.cellFor(this.expandedId);
        let nextCell = this.cellFor(item.id);

        if(!previousCell || previousCell.nativeElement.offsetTop != nextCell.nativeElement.offsetTop) {
          this.expandedId = item.id;
        }

        this.showDetailsId = item.id;
        this.showDetailsItem = item;
        this.showDetails = true;
      }
  }

  open(item: ChannelItem) {
    this.currentPath = item.id;
    this.fetchContents();
  }
}
