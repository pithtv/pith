import {Observable, Subject} from "rxjs";
import { Injectable } from "@angular/core";

var retryInterval = 3000;

@Injectable()
export class PithEventsService {
  private ws: WebSocket;
  private url: string;
  private events: Map<string, Subject<any>> = new Map();
  private ready: boolean = false;

  constructor() {
    this.url = (document.location.protocol == "http:" ? "ws" : "wss") + "://" + document.location.host + "/events";
    this.connect();
  }

  listenFor(event): Observable<any> {
    if (!this.events.has(event)) {
      if(this.ready) {
        this.registerEvent(event);
      }
      this.events.set(event, new Subject());
    }
    return this.events.get(event).asObservable();
  }

  private registerEvent(event) {
    this.ws.send(JSON.stringify({action: 'on', event: event}));
  }

  private connect() {
    console.log("Trying to connect to event server: " + this.url);
    const ws = this.ws = new WebSocket(this.url);
    ws.onopen = () => {
      console.log("Event server connection successful!");
      this.ready = true;
      this.events.forEach((subject, event) => {
        this.registerEvent(event);
      })
    };

    ws.onmessage = (data) => {
      var evt = JSON.parse(data.data);
      this.trigger(evt.event, evt.arguments);
    };

    ws.onclose = () => {
      console.log("Connection to event server lost");
      this.ready = false;
      setTimeout(() => {
        this.connect();
      }, retryInterval);
    };
  }

  private trigger(event, args) {
    if(this.events.has(event)) {
      this.events.get(event).next(args);
    }
  }
}
