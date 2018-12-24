
import {empty as observableEmpty, Observable, Subject, BehaviorSubject} from 'rxjs';

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
    if (typeof args[args.length - 1] == 'object') {
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
  private _statusSubject: Subject<PlayerStatus> = new BehaviorSubject(null);

  constructor(pith, properties) {
    super(pith);

    this.id = properties.id;
    this.friendlyName = properties.friendlyName;
    this.icons = properties.icons;

    this.on('playerstatechange', event => {
      if (event.player.id === this.id) {
        this._statusSubject.next(new PlayerStatus(event.status));
      }
    });
  }

  get root() {
    return ['player', this.id];
  }

  load(channel: Channel, item: ChannelItem) {
    this.get('load', channel.id, item.id).subscribe();
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
    return this._statusSubject.asObservable();
  }
}

export class ChannelItem {
  id: string;
  still: string;
  poster: string;
  backdrop: string;
  title: string;
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
  title: string;

  get root() {
    return ['channel', this.id];
  }

  listContents(path): Observable<ChannelItem[]> {
    return this.get('list', path || '', {includePlayStates: true}).pipe(map((results: object[]) => results.map(r => new ChannelItem(r))));
  }

  getDetails(path) {
    return this.get('detail', path || '', {includePlayStates: true}).pipe(map(result => new ChannelItem(result)));
  }

  togglePlayState(item) {
    if (item.playState && item.playState.status == 'watched') {
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
  private _progress: Subject<any> = new BehaviorSubject({loading: false});
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
      const p = Object.keys(query).reduce((p, k) => p.append(k, query[k]), new HttpParams());
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
      return observableEmpty();
    }), );
  }

  put(url: string, body: object) {
    return this.httpClient.put(`${this.root}/${url}`, body).pipe(tap(() => this.reportProgress({loading: false})), catchError((e, c) => {
      this.throw(new PithError(e.error));
      this.reportProgress({
        loading: false,
        error: true
      });
      return observableEmpty();
    }), );
  }

  queryChannels() {
    return (this.get('channels') as Observable<object[]>).pipe(map(p => p.map(p => new Channel(this, p))));
  }

  queryPlayers() {
    return (this.get('players') as Observable<object[]>).pipe(map(p => p.map(p => new RemotePlayer(this, p))));
  }

  getChannel(id: string): Observable<Channel> {
    return this.queryChannels().pipe(map((channels => channels.find(channel => channel.id == id))));
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

