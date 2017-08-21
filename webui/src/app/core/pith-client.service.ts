import {HttpClient, HttpParams} from "@angular/common/http";
import 'rxjs/Rx';
import {Observable} from "rxjs/Observable";
import {Injectable} from "@angular/core";

abstract class RestModule {
  constructor(private pith: PithClientService, properties: object) {
    Object.assign(this, properties);
  }

  abstract root: string[];

  protected get(...args: any[]) {
    let query: object;
    if(typeof args[args.length-1] == 'object') {
      query = args[args.length-1];
      args = args.slice(0, -1);
    }
    return this.pith.get(`${this.root.concat(args).map(encodeURIComponent).join('/')}`, query);
  }
}

export class Player extends RestModule {
  readonly id: string;
  readonly icons: object[];
  readonly friendlyName: string;

  get root() {
    return ['player', this.id];
  }

  load(channel: Channel, item: ChannelItem) {
    this.get("load", channel.id, item.id).subscribe();
  }

  play() {
    this.get("play").subscribe();
  }

  pause() {
    this.get("pause").subscribe();
  }

  stop() {
    this.get("stop").subscribe();
  }

  seek(time: number) {
    this.get("seek", {time: Math.floor(time)}).subscribe();
  }
}

export class ChannelItem {
  id: string;
  still: string;
  poster: string;
  title: string;
  mediatype: string;
  playState: any;

  constructor(p: Object) {
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
}

export class Channel extends RestModule {
  id: string;

  get root() {
    return ['channel', this.id];
  }

  listContents(path): Observable<ChannelItem[]> {
    return this.get('list', path, {includePlayStates:true}).map((results: object[]) => results.map(r => new ChannelItem(r)));
  }

  detail(path) {
    return this.get('detail', path, {includePlayStates:true}).map(result => new ChannelItem(result));
  }

  markWatched(item: any) {
    // TODO
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

  get(url, query?: object) {
    let options = {};
    if(query) {
      let p = Object.keys(query).reduce((p, k) => p.append(k, query[k]), new HttpParams());
      options['params'] = p;
    }
    return this.httpClient.get(`${this.root}/${url}`, options);
  }

  queryChannels() {
    return (this.get("channels") as Observable<object[]>).map(p => this.channels = p.map(p => new Channel(this, p)));
  }

  queryPlayers() {
    return (this.get("players") as Observable<object[]>).map(p => p.map(p => new Player(this, p)));
  }

  getChannel(id: string): Observable<Channel> {
    return this.queryChannels().map((channels => channels.find(channel => channel.id == id)));
  }
}

