import {Component, ViewChild} from "@angular/core";
import {WebPlayer} from "./web-player";

@Component({
  selector: 'video-player',
  templateUrl: 'video-player.component.html'
})
export class VideoPlayerComponent {
  stream: any;
  currentTime: number;

  @ViewChild("video")
  video: {nativeElement: HTMLVideoElement};

  @ViewChild("container")
  container: {nativeElement: HTMLElement};

  url: string;
  offset: number = 0;
  private refreshInterval: any;

  constructor(private webPlayer: WebPlayer) {

  }

  ngAfterViewInit() {
    this.webPlayer.activeStream.subscribe(stream => {
      if(stream) {
        this.loadStream(stream);
      }
    })
  }

  loadStream(stream) {
    let substream = stream.stream.streams.find(substream => {
      return this.video.nativeElement.canPlayType(substream.mimetype)
    });
    if (!substream) {
      alert("No playable stream found");
      return;
    }

    this.load(substream);
  }

  load(substream, options?: any) {
    if(options && options.offset) {
      this.url = substream.url + "&start=" + options.offset / 1000;
      this.offset = options.offset;
    } else {
      this.url = substream.url;
      this.offset = 0;
    }

    this.stream = substream;

    if(!this.refreshInterval) {
      this.refreshInterval = setInterval(() => {
        this.currentTime = this.video.nativeElement.currentTime * 1000 + this.offset;
      }, 100);
    }
  }

  unload() {
    clearInterval(this.refreshInterval);
    this.refreshInterval = null;
    this.stream = null;
  }

  play() {
    this.video.nativeElement.play();
  }

  pause() {
    this.video.nativeElement.pause();
  }

  seekTo(time) {
    if(this.stream.seekable) {
      this.video.nativeElement.currentTime = time / 1000;
    } else {
      this.load(this.stream, {offset: time});
    }
  }

  fullscreen() {
    let c:any = this.container.nativeElement;
    if(c.requestFullScreen) c.requestFullScreen();
    else if(c.webkitRequestFullscreen) c.webkitRequestFullscreen();
    else if(c.mozRequestFullScreen) c.mozRequestFullScreen();
  }
}
