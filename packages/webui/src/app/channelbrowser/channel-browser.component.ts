import {Component, Input, OnDestroy} from '@angular/core';
import {Channel} from '../core/pith-client.service';
import 'rxjs/Rx';
import {Subscription} from "rxjs";
import {Path} from "./details.component";
import {IChannelItem} from "@pithmediaserver/api";

@Component({
  templateUrl: './channel-browser.component.html',
  selector: 'channel-container-browser'
})
export class ChannelBrowserComponent implements OnDestroy {
  item: IChannelItem;
  channel: Channel;
  path: Path;
  private contents: IChannelItem[];
  filteredContents: IChannelItem[];

  private currentSearch: string;

  limit = 150;

  fieldDescriptions = {
    year: 'Year',
    rating: 'Rating',
    releaseDate: 'Release date',
    title: 'Title',
    runtime: 'Runtime',
    creationTime: 'Date added'
  };
  private subscription: Subscription;

  constructor() {
  }

  @Input()
  set channelAndItem({channel, item, path}: {channel: Channel, item: IChannelItem, path: Path}) {
    this.channel = channel;
    this.item = item;
    this.path = [...path];
    this.fetchContents();
  }

  fetchContents() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    this.subscription = this.channel.listContents(this.item && this.item.id).subscribe(contents => {
      this.contents = contents;
      this.search(this.currentSearch, true);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
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
      const filter = ((i) => i.title.toLocaleLowerCase().indexOf(value.toLocaleLowerCase()) !== -1);
      if (!forceFull && this.currentSearch && value.indexOf(this.currentSearch) !== -1) {
        this.filteredContents = this.filteredContents.filter(filter);
      } else {
        this.filteredContents = this.contents.filter(filter);
      }
    }
    this.currentSearch = value;
  }

  sort(sortField: string) {
    let direction;
    let transform = (x) => x;
    switch (sortField) {
      case 'year':
      case 'creationTime':
      case 'releaseDate':
      case 'rating':
        direction = -1;
        break;
      case 'title':
        transform = (x) => x.toUpperCase();
      // tslint:disable-next-line:no-switch-case-fall-through
      default:
        direction = 1;
    }
    const compareFn = function(a, b) {
      const tA = transform(a[sortField]);
      const tB = b[sortField];
      return direction * (tA < transform(tB) ? -1 : tA > transform(tB) ? 1 : 0);
    };
    this.contents.sort(compareFn);
    this.filteredContents.sort(compareFn);
  }

  loadMore() {
    this.limit += 150;
  }
}
