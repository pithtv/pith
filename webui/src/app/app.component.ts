import { Component } from '@angular/core';
import {PithClientService, Player} from "./core/pith-client.service"
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  selectedPlayer: Player;
  players: Observable<object[]>;
  channels: Observable<object[]>;
  title = 'app';

  constructor(private pithClient: PithClientService) {
    this.channels = pithClient.queryChannels();
    this.players = pithClient.players();

    this.players.subscribe(players => {
      if(this.selectedPlayer == null && players.length > 0) this.selectedPlayer = players[0];
    })
  }
}
