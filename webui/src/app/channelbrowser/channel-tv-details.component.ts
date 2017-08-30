import {Component, Input} from "@angular/core";
import {Channel, ChannelItem, Episode, Season, Show} from "../core/pith-client.service";
import {PlayerService} from "../core/player.service";

@Component({
  selector: 'channel-tv-details',
  templateUrl: './channel-tv-details.component.html'
})
export class ChannelTvDetailsComponent {
  _selectedSeason: Season;
  _item: Show;
  episodes: Episode[];
  seasons: Season[];
  // @Input() item: Show;
  @Input() channel: Channel;

  constructor(private playerService: PlayerService) {}

  load(item) {
    this.playerService.load(this.channel, item);
  }

  markWatched(item) {
    this.channel.markWatched(item);
  }

  @Input()
  set item(newItem) {
    this._item = newItem;
    this.fetchDetails();
  }

  get item() {
    return this._item;
  }

  fetchDetails() {
    if(this._item) {
      this.channel.getDetails(this._item.id).subscribe( (details: Show) => {
        this._item = details;
        this.seasons = details.seasons.sort(function(a,b) {
          return a.season == b.season ? 0 : a.season == 0 ? 1 : b.season == 0 ? -1 : a.season - b.season;
        });
        if(!this.selectedSeason || this.seasons.indexOf(this.selectedSeason) == -1) {
          let selectedSeason = this.seasons[0];
          for(var x=1,l=this.seasons.length;x<l;x++) {
            var season = this.seasons[x];
            if((season.playState && season.playState.status == 'inprogress') || (this.seasons[x-1].playState && this.seasons[x-1].playState.status == 'watched')) {
              selectedSeason = season;
            }
          }
          this.selectSeason(selectedSeason);
        }
      });
    }
  }

  selectSeason(season) {
    this.selectedSeason = season;
  }

  set selectedSeason(season: Season) {
    this._selectedSeason = season;
    this.episodes = this.item.episodes.filter(ep => ep.season == season.season).sort((a,b) => a.episode - b.episode );
  }

  get selectedSeason() {
    return this._selectedSeason;
  }
}
