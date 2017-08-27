import {Component, ViewChild} from '@angular/core';
import {Channel, PithClientService, PithError, Player, PlayerStatus} from "./core/pith-client.service"
import {Observable} from "rxjs/Observable";
import {PlayerService} from "./core/player.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Subscription} from "rxjs/Subscription";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  activePlayer: Player;
  channels: Observable<Channel[]>;
  title = 'app';
  statusSubscription: Subscription;

  @ViewChild("errorModal") errorModal;
  private errorMessage: string;
  private status: PlayerStatus;

  constructor(private pithClient: PithClientService, private playerService: PlayerService, private modalService: NgbModal) {
    this.channels = pithClient.queryChannels();
    pithClient.errors.subscribe(error => {
      this.showError(error);
    });

    this.playerService.activePlayer.subscribe(player => {
      this.activePlayer = player;
      if(this.statusSubscription) {
        this.statusSubscription.unsubscribe();
      }
      if(player) {
        this.statusSubscription = player.status.subscribe(status => {
          this.status = status
        });
      }
    });
  }

  pause() {
    this.playerService.pause();
  }

  stop() {
    this.playerService.stop();
  }

  play() {
    this.playerService.play();
  }

  get players() {
    return this.playerService.players;
  }

  selectPlayer(player) {
    this.playerService.selectPlayer(player);
  }

  private showError(error: PithError) {
    console.log(error);
    this.errorMessage = error.message;
    this.modalService.open(this.errorModal);
  }
}
