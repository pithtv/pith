import {Component, ViewChild} from '@angular/core';
import {Channel, PithClientService, PithError, RemotePlayer, PlayerStatus} from './core/pith-client.service';
import {Observable, Subscription} from 'rxjs';
import {PlayerService} from './core/player.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {WebPlayer} from './videoplayer/web-player';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  activePlayer: RemotePlayer;
  channels: Observable<Channel[]>;
  title = 'app';
  statusSubscription: Subscription;

  @ViewChild('errorModal', { static: true }) errorModal;
  private errorMessage: string;
  public status: PlayerStatus;
  public navbarCollapsed = true;
  public statusbarExpanded = false;

  constructor(private pithClient: PithClientService, private playerService: PlayerService,
              private modalService: NgbModal, public webPlayer: WebPlayer) {
    this.channels = pithClient.queryChannels();
    pithClient.errors.subscribe(error => {
      this.showError(error);
    });

    this.playerService.activePlayer.subscribe(player => {
      this.activePlayer = player;
      if (this.statusSubscription) {
        this.statusSubscription.unsubscribe();
      }
      if (player) {
        this.statusSubscription = player.status.subscribe(status => {
          this.status = status;
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

  seekTo(position) {
    this.playerService.seek(position);
  }

  toggleNavBar() {
    this.navbarCollapsed = !this.navbarCollapsed;
  }

  toggleStatusBar() {
    this.statusbarExpanded = !this.statusbarExpanded;
  }
}
