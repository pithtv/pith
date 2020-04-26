import {switchMap} from 'rxjs/operators';
import {AfterViewInit, Component, Input, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Channel, ChannelItem, PithClientService} from '../core/pith-client.service';
import 'rxjs/Rx';
import {animate, state, style, transition, trigger} from '@angular/animations';

const animationTiming = '500ms ease';

@Component({
  templateUrl: './channel-browser.component.html',
  selector: 'channel-container-browser'
})
export class ChannelBrowserComponent {
  item: ChannelItem;
  channel: Channel;
  private contents: ChannelItem[];
  filteredContents: ChannelItem[];
  currentPath: ChannelItem[] = [];

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

  constructor() {
  }

  @Input()
  set channelAndItem({channel, item}: {channel: Channel, item: ChannelItem}) {
    this.channel = channel;
    this.item = item;
    this.fetchContents();
  }

  fetchContents() {
    this.channel.listContents(this.item && this.item.id).subscribe(contents => {
      this.contents = contents;
      this.search(this.currentSearch, true);
    });
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
      default:
        direction = 1;
    }
    const compareFn = function(a, b) {
      return direction * (transform(a[sortField]) < transform(b[sortField]) ? -1 : transform(a[sortField]) > transform(b[sortField]) ? 1 : 0);
    };
    this.contents.sort(compareFn);
    this.filteredContents.sort(compareFn);
  }

  loadMore() {
    this.limit += 150;
  }
}
