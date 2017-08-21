import {Channel, ChannelItem, PithClientService, Player} from "./pith-client.service";
import {Observable} from "rxjs/Observable";
import {Injectable} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class PlayerService {
  activePlayer: Player;
  readonly _players: Subject<Player[]> = new BehaviorSubject([]);

  constructor(private pith: PithClientService) {
    this.pith.queryPlayers().subscribe(p => {
      this._players.next(p);
      if(this.activePlayer == null && p.length > 0) {
        this.activePlayer = p[0];
      }
    });
  }

  get players() {
    return this._players.asObservable();
  }

  play() {
    this.activePlayer.play();
  }

  pause() {
    this.activePlayer.pause();
  }

  stop() {
    this.activePlayer.stop();
  }

  load(channel: Channel, item: ChannelItem) {
    this.activePlayer.load(channel, item);
  }

  seek(time: number) {
    this.activePlayer.seek(time);
  }

}
