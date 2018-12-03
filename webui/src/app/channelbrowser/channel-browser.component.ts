import {switchMap} from 'rxjs/operators';
import {AfterViewInit, Component, Input, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Channel, ChannelItem, PithClientService} from '../core/pith-client.service';
import 'rxjs/Rx';
import {animate, state, style, transition, trigger} from '@angular/animations';

const animationTiming = '500ms ease';

@Component({
  templateUrl: './channel-browser.component.html',
  animations: [
    trigger('expand',
      [
        state('expanded', style({'margin-bottom': '392px'})),
        state('collapsed', style({'margin-bottom': '0'})),
        state('assumeexpanded', style({'margin-bottom': '0'})),
        transition('expanded => collapsed, collapsed => expanded', animate(animationTiming))
      ]),
    trigger('visibility',
      [
        state('expanded', style({'height': '*'})),
        state('assumeexpanded', style({'height': '0'})),
        state('collapsed', style({'height': '0', display: 'none'})),
        transition('expanded => collapsed, collapsed => expanded', animate(animationTiming))
      ])
  ]
})
export class ChannelBrowserComponent implements AfterViewInit, OnInit {
  protected itemDetails: ChannelItem;
  protected channel: Channel;
  private currentContainerId: string;
  private contents: ChannelItem[];
  protected filteredContents: ChannelItem[];
  private currentPath: ChannelItem[] = [];

  protected showDetailsId: string;
  protected showDetailsIdx: number;
  protected showDetails: boolean;

  private currentSearch: string;

  private itemsPerRow: number;

  @ViewChild('container') container;
  @ViewChildren('cell') cells;

  fieldDescriptions = {
    year: 'Year',
    rating: 'Rating',
    releaseDate: 'Release date',
    title: 'Title',
    runtime: 'Runtime',
    creationTime: 'Date added'
  };

  resetItemOffsets() {
    this.itemsPerRow = Math.floor((window.innerWidth - 20) / 110); // defined in poster.scss through the media queries
  }

  ngAfterViewInit() {
    this.resetItemOffsets();
    window.addEventListener('resize', () => {
      this.resetItemOffsets();
    });
  }

  constructor(private route: ActivatedRoute,
              private pithClient: PithClientService) {
  }

  fetchContents() {
    this.toggle(null);
    this.channel.listContents(this.currentContainerId).subscribe(contents => {
      this.contents = contents;
      this.search(this.currentSearch, true);
    });
    this.channel.getDetails(this.currentContainerId).subscribe(details => this.itemDetails = details);
  }

  ngOnInit() {
    this.route.paramMap.pipe(switchMap((params: ParamMap) => {
      const id = params.get('id');
      return this.pithClient.getChannel(id);
    })).subscribe((channel: Channel) => {
      this.channel = channel;
      this.currentContainerId = '';
      this.currentPath = [];
      this.fetchContents();
    });
  }

  toggle(item: ChannelItem, idx?) {
      if (item == null || this.showDetailsId === item.id) {
        this.showDetailsId = null;
        this.showDetails = false;
        this.showDetailsIdx = -1;
      } else {
        this.showDetailsId = item.id;
        this.showDetails = true;
        this.showDetailsIdx = idx;
      }
  }

  @Input()
  set searchString(value) {
    this.search(value);
  }

  search(value: string, forceFull?: boolean) {
    if (!value) {
      this.filteredContents = this.contents;
    } else {
      const filter = ((i) => i.title.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) != -1);
      if (!forceFull && this.currentSearch && value.indexOf(this.currentSearch) != -1) {
        this.filteredContents = this.filteredContents.filter(filter);
      } else {
        this.filteredContents = this.contents.filter(filter);
      }
    }
    this.currentSearch = value;
  }

  sort(sortField: string) {
    let direction;
    switch (sortField) {
      case 'year':
      case 'creationTime':
      case 'releaseDate':
      case 'rating':
        direction = -1;
        break;
      default:
        direction = 1;
    }
    const compareFn = function(a, b) {
      return direction * (a[sortField] < b[sortField] ? -1 : a[sortField] > b[sortField] ? 1 : 0);
    };
    this.contents.sort(compareFn);
    this.filteredContents.sort(compareFn);
  }

  open(item: ChannelItem) {
    this.currentContainerId = item.id;
    this.fetchContents();
    this.currentPath.push(item);
  }

  goBack(item) {
    const x = this.currentPath.indexOf(item);
    this.currentPath.splice(x + 1);
    this.currentContainerId = item.id;
    this.fetchContents();
  }

  goToChannelRoot() {
    this.currentPath = [];
    this.currentContainerId = '';
    this.fetchContents();
  }

  rowIdx(idx) {
    return Math.floor(idx / this.itemsPerRow);
  }
}
