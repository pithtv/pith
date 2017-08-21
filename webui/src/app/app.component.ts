import { Component } from '@angular/core';
import {Channel, PithClientService, Player} from "./core/pith-client.service"
import {Observable} from "rxjs/Observable";
import {PlayerService} from "./core/player.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  channels: Observable<Channel[]>;
  title = 'app';

  constructor(private pithClient: PithClientService, private playerService: PlayerService) {
    this.channels = pithClient.queryChannels();
  }

  get players() {
    return this.playerService.players;
  }

  get activePlayer() {
    return this.playerService.activePlayer;
  }

  set activePlayer(player) {
    this.playerService.activePlayer = player;
  }
}
