import {Component, Input} from '@angular/core';
import {Channel, ChannelItem, Episode, Season, Show} from '../core/pith-client.service';
import {PlayerService} from '../core/player.service';
import {Path} from "./details.component";

@Component({
  selector: 'channel-tv-details',
  templateUrl: './tv-details.component.html'
})
export class TvDetailsComponent {
  _selectedSeason: Season;
  _item: Show;
  channel: Channel;
  episodes: Episode[];
  seasons: Season[];
  path: Path;

  constructor(private playerService: PlayerService) {
  }

  @Input()
  set channelAndItem({channel, item, path}: {channel: Channel, item: ChannelItem, path: Path}) {
    this._item = item as Show;
    this.channel = channel;
    this.path = [...path];
    this.fetchDetails();
  }

  load(item) {
    this.playerService.load(this.channel, item);
  }

  togglePlayState(item) {
    this.channel.togglePlayState(item);
  }

  get item() {
    return this._item;
  }

  fetchDetails() {
    if (this._item) {
      this.seasons = this._item.seasons.sort((a, b) =>
        a.season === b.season ? 0 : a.season === 0 ? 1 : b.season === 0 ? -1 : a.season - b.season);
      if (!this.selectedSeason || this.seasons.indexOf(this.selectedSeason) === -1) {
        let selectedSeason = this.seasons[0];
        for (let x = 1, l = this.seasons.length; x < l; x++) {
          const season = this.seasons[x];
          if ((season.playState && season.playState.status === 'inprogress')
            || (this.seasons[x - 1].playState && this.seasons[x - 1].playState.status === 'watched')) {
            selectedSeason = season;
          }
        }
        this.selectSeason(selectedSeason);
      }
    }
  }

  selectSeason(season) {
    this.selectedSeason = season;
  }

  set selectedSeason(season: Season) {
    this._selectedSeason = season;
    this.episodes = this.item.episodes.filter(ep => ep.season == season.season).sort((a, b) => a.episode - b.episode);
  }

  get selectedSeason() {
    return this._selectedSeason;
  }
}
