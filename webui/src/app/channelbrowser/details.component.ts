import {Component, Input, OnInit} from "@angular/core";
import {switchMap} from "rxjs/operators";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {Channel, ChannelItem, PithClientService} from "../core/pith-client.service";
import {Observable} from "rxjs";

@Component({
  templateUrl: './details.component.html'
})
export class DetailsComponent implements OnInit {
  channelAndItem: {channel: Channel, item: ChannelItem};
  item: ChannelItem;

  constructor(private route: ActivatedRoute, private pithClient: PithClientService) {
  }

  ngOnInit() {
    this.route.paramMap.pipe(switchMap(params => {
      const channelId = params.get('id');
      const itemId = params.get('itemId');
      return this.pithClient.getChannel(channelId).pipe(switchMap(channel => {
        if(itemId) {
          return channel.getDetails(itemId).pipe(switchMap(itemDetails => Observable.of({
            channel: channel,
            item: itemDetails
          })));
        } else {
          return Observable.of({
            channel: channel, item: null
          });
        }
      }))
    })).subscribe(channelAndItem => {
      this.channelAndItem = channelAndItem;
      this.item = channelAndItem.item;
    });
  }
}
