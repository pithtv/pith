import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AppComponent } from './app.component';
import {TimePipe} from "./core/time.pipe";
import {ScrubberComponent} from "./util/scrubber.component";
import {VideoPlayerComponent} from "./videoplayer/video-player.component";
import {PrescalePipe} from "./util/prescale.pipe";
import {PithClientService} from "./core/pith-client.service";
import {HttpClient, HttpHandler} from "@angular/common/http";
import {PithEventsService} from "./core/pith-events.service";
import {PlayerService} from "./core/player.service";
import {WebPlayer} from "./videoplayer/web-player";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        AppComponent,
        TimePipe,
        ScrubberComponent,
        VideoPlayerComponent,
        PrescalePipe
      ],
      providers: [
        HttpHandler,
        HttpClient,
        PithClientService,
        PithEventsService,
        PlayerService,
        WebPlayer
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'app'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('app');
  }));
});
