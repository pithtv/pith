import {HttpClient} from "@angular/common/http";
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";
import {Injectable} from "@angular/core";

export class Player {
  constructor(p: Object) {
    Object.assign(this, p);
  }
}

export class ChannelItem {
  id: string;
  still: string;
  poster: string;
  title: string;
  mediatype: string;
  playState: any;

  constructor(private pith: PithClientService, p: Object) {
    Object.assign(this, p);
  }
}

export class Episode extends ChannelItem {
  season: number;
  episode: number;
  showname: string;
}

export class Season extends ChannelItem {
  season: number;
}

export class Show extends ChannelItem {
  seasons: Season[];
  episodes: Episode[];

  constructor(pith: PithClientService, p: Object) {
    super(pith, p);
  }
}

export class Channel {
  id: string;

  constructor(private pith: PithClientService, p: Object) {
    Object.assign(this, p);
  }

  listContents(path): Observable<ChannelItem[]> {
    return this.pith.get(`channel/${this.id}/list/${path}?includePlayStates=true`).map((results: object[]) => results.map(r => new ChannelItem(this.pith, r)));
  }

  detail(path) {
    return this.pith.get(`channel/${this.id}/detail/${path}?includePlayStates=true`).map(result => new ChannelItem(this.pith, result));
  }
}

@Injectable()
export class PithClientService {
  private channels: Channel[];
  private root: string;

  constructor(
    private httpClient: HttpClient
  ) {
    this.root = "/rest";
  }

  get(url) {
    return this.httpClient.get(`${this.root}/${url}`);
  }

  queryChannels() {
    return (this.get("channels") as Observable<object[]>).map(p => this.channels = p.map(p => new Channel(this, p)));
  }

  private queryPlayers() {
    return (this.get("players") as Observable<object[]>).map(p => p.map(p => new Player(p)));
  }

  players() {
    return this.queryPlayers();
  }

  getChannel(id: string): Observable<Channel> {
    return this.queryChannels().map((channels => channels.find(channel => channel.id == id)));
  }
}

