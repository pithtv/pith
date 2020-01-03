import {Channel, ChannelItem, PithClientService, RemotePlayer, PlayerStatus} from "./pith-client.service";
import {Observable, Subject, BehaviorSubject} from "rxjs";
import {Injectable} from "@angular/core";

enum Status {
  PAUSED,
  PLAYING,
  STOPPED
}

@Injectable()
export class PlayerService {
  private _activePlayer: RemotePlayer;
  private _players = [];

  readonly _activePlayerSubject: Subject<RemotePlayer> = new BehaviorSubject(null);
  readonly _playersSubject: Subject<RemotePlayer[]> = new BehaviorSubject([]);
  readonly _status: Subject<PlayerStatus> = new BehaviorSubject(null);

  constructor(private pith: PithClientService) {
    this.pith.queryPlayers().subscribe(p => {
      this._players = p;
      this._playersSubject.next(p);
      if(this._activePlayer == null && p.length > 0) {
        this.selectPlayer(p[0]);
      }
    });

    this.pith.on("playerregistered").subscribe(([event]) => {
      var player = new RemotePlayer(this.pith, event.player);
      this._players = this._players.concat([player]);
      this._playersSubject.next(this._players);
      if(!this._activePlayer) {
        this.selectPlayer(player);
      }
    });

    this.pith.on("playerdisappeared").subscribe(([event]) => {
      var player = event.player;
      this._players = this._players.filter((e) => e.id !== player.id);
      this._playersSubject.next(this._players);

      if (this._activePlayer.id == player.id) {
        if (this._players.length > 0) {
          this.selectPlayer(this._players[0]);
        } else {
          this.selectPlayer(null);
        }
      }
    })
  }

  selectPlayer(player) {
    this._activePlayer = player;
    this._activePlayerSubject.next(player);
  }

  get players() {
    return this._playersSubject.asObservable();
  }

  get activePlayer() {
    return this._activePlayerSubject.asObservable();
  }

  play() {
    this._activePlayer.play();
  }

  pause() {
    this._activePlayer.pause();
  }

  stop() {
    this._activePlayer.stop();
  }

  load(channel: Channel, item: ChannelItem) {
    this._activePlayer.load(channel, item);
  }

  seek(time: number) {
    this._activePlayer.seek(time);
  }

}
