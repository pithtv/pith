import {Component, OnInit} from "@angular/core";
import {switchMap} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {Channel, PithClientService} from "../core/pith-client.service";
import {forkJoin, Observable, of} from "rxjs";
import {IChannelItem} from "@pithmediaserver/api";

export type Path = { id: string, title: string }[];

@Component({
  templateUrl: './details.component.html'
})
export class DetailsComponent implements OnInit {
  channelAndItem: {channel: Channel, item: IChannelItem, path: Path};
  item: IChannelItem;

  constructor(private route: ActivatedRoute, private pithClient: PithClientService) {
  }

  ngOnInit() {
    this.route.paramMap.pipe(switchMap(params => {
      const channelId = params.get('id');
      const itemId = params.get('itemId');
      return this.pithClient.getChannel(channelId).pipe(switchMap(channel =>
        forkJoin({
          channel: of(channel),
          item: channel.getDetails(itemId),
          path: this.buildPath(channel, itemId)
        })
      ));
    })).subscribe(channelAndItem => {
      this.channelAndItem = channelAndItem;
      this.item = channelAndItem.item;
    });
  }

  buildPath(channel: Channel, id: string): Observable<Path> {
    if (!id) {
      return of([]);
    }
    const path = id.split('/').map((a, i, r) => r.slice(0, i + 1).join('/'));
    if (!path.length) {
      return of([]);
    }
    return forkJoin(path.map(p => channel.getDetails(p, {noRefresh: true})));
  }
}
