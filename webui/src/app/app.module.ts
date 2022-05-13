import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';

import {PithLogoComponent} from './pith-logo.component';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {PithClientService} from './core/pith-client.service';
import {PrescalePipe} from './util/prescale.pipe';
import {ChannelBrowserComponent} from './channelbrowser/channel-browser.component';
import {GenericDetailsComponent} from './channelbrowser/generic-details.component';
import {TvDetailsComponent} from './channelbrowser/tv-details.component';
import {PlayerService} from './core/player.service';
import {PithEventsService} from './core/pith-events.service';
import {TimePipe} from './core/time.pipe';
import {FormsModule} from '@angular/forms';
import {SettingsModule} from './settings/settings.module';
import {ScrubberComponent} from './util/scrubber.component';
import {WebPlayer} from './videoplayer/web-player';
import {VideoPlayerComponent} from './videoplayer/video-player.component';
import {CommonModule} from '@angular/common';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ServiceWorkerModule} from '@angular/service-worker';
import {environment} from '../environments/environment';
import {PlaybackModalComponent} from './core/playback-modal';
import {DetailsComponent} from "./channelbrowser/details.component";
import {SwipeFromLeftDirective} from "./util/swipe-from-left.directive";
import {SwipeOutDirective} from "./util/swipe-out.directive";
import {ItemActionsComponent} from "./channelbrowser/item-actions.component";
import {ItemOtherActionsComponent} from "./channelbrowser/item-other-actions.component";
import {StartPageComponent} from "./startpage/start-page.component";
import {RibbonComponent} from "./startpage/ribbon.component";
import {SyntheticScrollDirective} from "./util/synthetic-scroll.directive";
import {ImagePipe} from "./util/image.pipe";

@NgModule({
  declarations: [
    AppComponent,
    PithLogoComponent,
    ChannelBrowserComponent,
    DetailsComponent,
    GenericDetailsComponent,
    TvDetailsComponent,
    PlaybackModalComponent,
    PrescalePipe,
    TimePipe,
    ScrubberComponent,
    VideoPlayerComponent,
    SwipeFromLeftDirective,
    SwipeOutDirective,
    ItemActionsComponent,
    ItemOtherActionsComponent,
    StartPageComponent,
    RibbonComponent,
    SyntheticScrollDirective,
    ImagePipe
  ],
  exports: [
    TimePipe
  ],
  imports: [
    InfiniteScrollModule,
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    SettingsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    PithClientService,
    PithEventsService,
    PlayerService,
    WebPlayer
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    PlaybackModalComponent
  ]
})
export class AppModule {
}
