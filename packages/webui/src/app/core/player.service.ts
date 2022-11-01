import {Channel, PithClientService, Player, RemotePlayer} from './pith-client.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {Injectable} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {PlaybackModalComponent} from './playback-modal';
import {IChannelItem} from "@pithmediaserver/api";

const SELECTED_PLAYER_STORAGE_ITEM = 'selectedPlayer';

@Injectable()
export class PlayerService {
  private _activePlayer: RemotePlayer;
  private _players = [];

  readonly _activePlayerSubject: Subject<RemotePlayer> = new BehaviorSubject(null);
  readonly _playersSubject: Subject<RemotePlayer[]> = new BehaviorSubject([]);

  constructor(private pith: PithClientService, private ngbModalService: NgbModal) {
    this.refreshPlayerList();

    this.pith.on('playerregistered').subscribe(([event]) => {
      const player = new RemotePlayer(this.pith, event.player);
      this._players = this._players.concat([player]);
      this._playersSubject.next(this._players);
      if (!this._activePlayer) {
        this.selectPlayer(player);
      }
    });

    this.pith.on('playerdisappeared').subscribe(([event]) => {
      const player = event.player;
      this._players = this._players.filter((e) => e.id !== player.id);
      this._playersSubject.next(this._players);

      if (this._activePlayer.id === player.id) {
        if (this._players.length > 0) {
          this.selectPlayer(this._players[0]);
        } else {
          this.selectPlayer(null);
        }
      }
    });

    this.pith.on('connectionChanged').subscribe(({connected}) => {
      if(connected) {
        this.refreshPlayerList();
      }
    });
  }

  private refreshPlayerList() {
    this.pith.queryPlayers().subscribe(p => {
      this._players = p;
      this._playersSubject.next(p);
      if (this._activePlayer == null && p.length > 0) {
        let selectedPlayer = localStorage.getItem(SELECTED_PLAYER_STORAGE_ITEM);
        let player: Player;
        if (selectedPlayer) {
          player = p.find(p => p.id === selectedPlayer);
        }
        if (!player) {
          player = p[0];
        }
        this.selectPlayer(player);
      }
    });
  }

  selectPlayer(player) {
    localStorage.setItem(SELECTED_PLAYER_STORAGE_ITEM, player.id);
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

  async load(channel: Channel, item: IChannelItem) {
    let seekTime = null;
    if (item.playState && item.playState.status === 'inprogress') {
      const modal = this.ngbModalService.open(PlaybackModalComponent);
      modal.componentInstance.item = item;
      try {
        const result = await modal.result;
        if (result.resume) {
          seekTime = item.playState.time;
        }
      } catch (err) {
        return;
      }
    }
    this._activePlayer.load(channel, item, seekTime);
  }

  seek(time: number) {
    this._activePlayer.seek(time);
  }

}
