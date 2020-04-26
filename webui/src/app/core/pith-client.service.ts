import {Observable, Subject, BehaviorSubject, EMPTY} from 'rxjs';

import {tap, map, catchError} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {PithEventsService} from './pith-events.service';

abstract class RestModule {
  constructor(private pith: PithClientService, properties?: object) {
    Object.assign(this, properties);
  }

  abstract root: string[];

  protected get(...args: any[]) {
    let query: object;
    if (typeof args[args.length - 1] === 'object') {
      query = args[args.length - 1];
      args = args.slice(0, -1);
    }
    return this.pith.get(`${this.root.concat(args).map(encodeURIComponent).join('/')}`, query);
  }

  protected put(...args: any[]) {
    const body = args.pop();
    return this.pith.put(`${this.root.concat(args).map(encodeURIComponent).join('/')}`, body);
  }

  protected on(event, callback) {
    this.pith.on(event).subscribe(args => callback.apply(null, args));
  }
}

export class PlayerStatus {
  private timestamp: Date;
  actions: {play: boolean, stop: boolean, pause: boolean};
  position?: {title?: string, time?: number, duration?: number};

  constructor(obj: any) {
    Object.assign(this, obj);
    this.timestamp = new Date();
  }
}

export interface Player {
  readonly icons: object[];
  readonly friendlyName: string;
  readonly status: Observable<PlayerStatus>;
  load (channel: Channel, item: ChannelItem);
  play();
  pause();
  stop();
  seek(time: number);
}

export class RemotePlayer extends RestModule {
  readonly id: string;
  readonly icons: object[];
  readonly friendlyName: string;
  private statusSubject: Subject<PlayerStatus> = new BehaviorSubject(null);

  constructor(pith, properties) {
    super(pith);

    this.id = properties.id;
    this.friendlyName = properties.friendlyName;
    this.icons = properties.icons;

    this.on('playerstatechange', event => {
      if (event.player.id === this.id) {
        this.statusSubject.next(new PlayerStatus(event.status));
      }
    });
  }

  get root() {
    return ['player', this.id];
  }

  load(channel: Channel, item: ChannelItem, seekTime?: number) {
    this.get('load', channel.id, item.id, seekTime !== null ? {time: seekTime} : {}).subscribe();
  }

  play() {
    this.get('play').subscribe();
  }

  pause() {
    this.get('pause').subscribe();
  }

  stop() {
    this.get('stop').subscribe();
  }

  seek(time: number) {
    this.get('seek', {time: Math.floor(time)}).subscribe();
  }

  get status() {
    return this.statusSubject.asObservable();
  }
}

export interface ChannelItem {
  id: string;
  still: string;
  poster: string;
  backdrop: string;
  title: string;
  airDate: string;
  mediatype: string;
  playState: any;
  sortableFields: string[];
  tagline: string;
  rating: string;
  genres: string[];
  plot: string;
  overview: string;
  hasNew: boolean;
  unavailable: boolean;
  type: string;
  year: string;
  playable: boolean;
  imdbId: string;
  tmdbId: string;

  showname: string;
  episode: number;
  season: number;
  duration?: number;
}

export interface Episode extends ChannelItem {
  season: number;
  episode: number;
  showname: string;
}

export interface Season extends ChannelItem {
  season: number;
}

export interface Show extends ChannelItem {
  seasons: Season[];
  episodes: Episode[];
}

export class Channel extends RestModule {
  id: string;
  title: string;

  get root() {
    return ['channel', this.id];
  }

  listContents(path): Observable<ChannelItem[]> {
    return this.get('list', path || '', {includePlayStates: true}) as Observable<ChannelItem[]>;
  }

  getDetails(path): Observable<ChannelItem> {
    return this.get('detail', path || '', {includePlayStates: true}) as Observable<ChannelItem>;
  }

  togglePlayState(item) {
    if (item.playState && item.playState.status === 'watched') {
      item.playState = {status: 'none'};
    } else {
      item.playState = {status: 'watched'};
    }
    this.setPlayState(item.id, item.playState);
  }

  setPlayState(path, playstate) {
    this.put('playstate', path, playstate).subscribe();
  }

  stream(path, options?: any) {
    return this.get('stream', path || '', options);
  }
}

export class PithSettings {
  apiContext: string;
  bindAddress: string;
  couchpotato: {
    enabled: boolean,
    url: string,
    apikey: string
  };
  upnpsharing: {
    enabled: boolean,
    port?: number
  };
  dbEngine: string;
  files: {
    rootDir: string,
    excludeExtensions: string[],
    showHiddenFiles: boolean
  };
  httpPort: number;
  library: {
    folders: [{
      channelId: string,
      containerId: string,
      contains: string,
      scanAutomatically: boolean
    }],
    scanInterval: number
  };
  maxAgeForNew: number;
  mongoUrl: string;
  pithContext: string;
  server: string;
  sonarr: {
    enabled: boolean,
    url: string,
    apikey: string
  };
}

export class PithError {
  message: string;
  code: string;
  error: string;

  constructor(e: object) {
    Object.assign(this, e);
  }
}

@Injectable()
export class PithClientService {
  private root: string;
  private _errors: Subject<PithError> = new Subject();
  private _progress: Subject<{loading: boolean}> = new BehaviorSubject({loading: false});
  private loadingCounter = 0;

  constructor(
    private httpClient: HttpClient,
    private eventService: PithEventsService
  ) {
    this.root = '/rest';
  }

  get(url, query?: object) {
    const options = {};
    if (query) {
      const p = Object.keys(query).reduce((pp, k) => pp.append(k, query[k]), new HttpParams());
      options['params'] = p;
    }
    this.reportProgress({
      loading: true
    });
    return this.httpClient.get(`${this.root}/${url}`, options).pipe(tap(() => this.reportProgress({loading: false})), catchError((e, c) => {
      this.throw(new PithError(e.error));
      this.reportProgress({
        loading: false,
        error: true
      });
      return EMPTY;
    }), );
  }

  put(url: string, body: object) {
    return this.httpClient.put(`${this.root}/${url}`, body).pipe(tap(() => this.reportProgress({loading: false})), catchError((e, c) => {
      this.throw(new PithError(e.error));
      this.reportProgress({
        loading: false,
        error: true
      });
      return EMPTY;
    }), );
  }

  queryChannels() {
    return (this.get('channels') as Observable<object[]>).pipe(map(p => p.map(pp => new Channel(this, pp))));
  }

  queryPlayers() {
    return (this.get('players') as Observable<object[]>).pipe(map(p => p.map(pp => new RemotePlayer(this, pp))));
  }

  getChannel(id: string): Observable<Channel> {
    return this.queryChannels().pipe(map((channels => channels.find(channel => channel.id === id))));
  }

  get errors() {
    return this._errors.asObservable();
  }

  throw(error: PithError) {
    this._errors.next(error);
  }

  private reportProgress(progress) {
    if (progress.loading) {
      this.loadingCounter++;
    } else {
      this.loadingCounter--;
    }
    progress.loading = this.loadingCounter > 0;
    this._progress.next(progress);
  }

  get progress() {
    return this._progress.asObservable();
  }

  on(event) {
    return this.eventService.listenFor(event);
  }

  loadSettings() {
    return (this.get('settings') as Observable<PithSettings>);
  }

  storeSettings(settings: PithSettings) {
    return this.put('settings', settings).subscribe();
  }
}

