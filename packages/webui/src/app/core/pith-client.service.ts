import {BehaviorSubject, EMPTY, merge, Observable, of, Subject} from 'rxjs';

import {catchError, finalize, map, tap} from 'rxjs/operators';
import {HttpClient, HttpParams} from '@angular/common/http';
import 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {PithEventsService} from './pith-events.service';
import {IChannelItem, RibbonItem, Settings, StreamDescriptor} from "@pithmediaserver/api";

export interface CacheOptions {
  noRefresh?: boolean;
}

abstract class RestModule {
  constructor(private pith: PithClientService, properties?: object) {
    Object.assign(this, properties);
  }

  abstract root: string[];

  protected get<T = Object>(...args: any[]) {
    let query: object;
    if (typeof args[args.length - 1] === 'object') {
      query = args[args.length - 1];
      args = args.slice(0, -1);
    }
    return this.pith.get<T>(`${this.root.concat(args).map(encodeURIComponent).join('/')}`, query);
  }

  protected getAndCache<T = Object>(cacheOptions: CacheOptions = null, ...args: any[]) {
    let query: object;
    if (typeof args[args.length - 1] === 'object') {
      query = args[args.length - 1];
      args = args.slice(0, -1);
    }
    return this.pith.getAndCache<T>(`${this.root.concat(args).map(encodeURIComponent).join('/')}`, query, cacheOptions);
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
  actions: { play: boolean, stop: boolean, pause: boolean };
  position?: { title?: string, time?: number, duration?: number };

  constructor(obj: any) {
    Object.assign(this, obj);
    this.timestamp = new Date();
  }
}

export interface Player {
  readonly icons: object;
  readonly friendlyName: string;
  readonly status: Observable<PlayerStatus>;

  load(channel: Channel, item: IChannelItem);

  play();

  pause();

  stop();

  seek(time: number);
}

export class RemotePlayer extends RestModule implements Player {
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

  load(channel: Channel, item: IChannelItem, seekTime?: number) {
    this.loadById(channel.id, item.id, seekTime);
  }

  loadById(channel: string, item: string, seekTime?: number) {
    this.get('load', channel, item, seekTime !== null ? {time: seekTime} : {}).subscribe();
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

export class Channel extends RestModule {
  id: string;
  title: string;

  get root() {
    return ['channel', this.id];
  }

  listContents(path, cacheOptions?: CacheOptions): Observable<IChannelItem[]> {
    return this.getAndCache(null, 'list', path || '') as Observable<IChannelItem[]>;
  }

  getDetails(path, cacheOptions?: CacheOptions): Observable<IChannelItem> {
    return this.getAndCache(cacheOptions, 'detail', path || '') as Observable<IChannelItem>;
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

  stream(path, options: any = {}): Observable<{ item: IChannelItem, stream: StreamDescriptor }> {
    return this.get<{ item: IChannelItem, stream: StreamDescriptor }>('stream', path || '', options);
  }
}

export class Ribbon extends RestModule {
  public readonly id: string;
  public readonly name: string;

  get root() {
    return ['ribbons', this.id];
  }

  listContents(): Observable<RibbonItem[]> {
    return this.getAndCache(null) as Observable<RibbonItem[]>
  }
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
  private _progress: Subject<{ loading: boolean }> = new BehaviorSubject({loading: false});
  private loadingCounter = 0;
  private cache = new Map<string, object>();

  constructor(
    private httpClient: HttpClient,
    private eventService: PithEventsService
  ) {
    this.root = '/rest';
  }

  get<T = object>(url, query?: object): Observable<T> {
    const options = {};
    if (query) {
      options['params'] = Object.keys(query).reduce((pp, k) => pp.append(k, query[k]), new HttpParams());
    }
    this.reportProgress({
      loading: true
    });
    let finalized = false;
    return this.httpClient.get(`${this.root}/${url}`, options).pipe(catchError((e, c) => {
      this.throw(new PithError(e.error));
      return EMPTY;
    }), finalize(() => {
      if (finalized) {
        return;
      }
      finalized = true;
      this.reportProgress({
        loading: false
      });
    })) as Observable<T>;
  }

  getAndCache<T = Object>(url, query?: object, cacheOptions?: CacheOptions): Observable<T> {
    const cacheKey = JSON.stringify({url, query});
    let requestFactory = () => this.get<T>(url, query).pipe(tap(v => {
      this.cache.set(cacheKey, v as any);
    }));
    if (this.cache.has(cacheKey)) {
      if (cacheOptions?.noRefresh) {
        return of(this.cache.get(cacheKey) as unknown as T);
      } else {
        return merge(of(this.cache.get(cacheKey)), requestFactory()) as Observable<T>;
      }
    } else {
      return requestFactory();
    }
  }

  put(url: string, body: object) {
    let finalized = false;
    return this.httpClient.put(`${this.root}/${url}`, body).pipe(catchError((e, c) => {
      this.throw(new PithError(e.error));
      return EMPTY;
    }), finalize(() => {
      if (finalized) {
        return;
      }
      finalized = true;
      this.reportProgress({
        loading: false
      });
    }));
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

  queryRibbons(): Observable<Ribbon[]> {
    return (this.get('ribbons') as Observable<any>).pipe(map(p => p.map(pp => new Ribbon(this, pp))));
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
    return (this.get('settings') as Observable<Settings>);
  }

  storeSettings(settings: Settings) {
    return this.put('settings', settings).subscribe();
  }
}

