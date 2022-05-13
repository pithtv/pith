import * as mdns from "mdns";
import fetch from 'node-fetch';
import {EventEmitter} from "events";
import {VlcClient} from "./VlcClient";

export class VlcDiscovery extends EventEmitter {
  private clients: VlcClient[] = [];
  start() {
    const browser = mdns.createBrowser(mdns.tcp("http"));
    browser.on("serviceUp", (evt) => {
      this.probe(evt.addresses, evt.port);
    });
    browser.on("serviceDown", (evt) => {
      this.collect(evt.addresses, evt.port);
    })
    browser.start();
  }

  private async probe(addresses: Array<string>, port: number) {
    for(let addr of addresses) {
      try {
        let response = await fetch(`http://${addr}:${port}/playerControl.js`);
        if(response.status === 200) {
          this.notify(addr, port);
          return;
        }
      } catch(e) {
      }
    }
  }

  private collect(addresses: Array<string>, port: number) {
    let clientIdx = this.clients.findIndex(c => addresses.includes(c.address) && port === c.port);
    if(clientIdx < 0) return;
    let client = this.clients.splice(clientIdx, 1)[0];
    this.emit('serviceDown', client);
  }

  notify(addr: string, port: number) {
    let client = new VlcClient(addr, port);
    this.clients.push(client);
    this.emit('serviceUp', client);
  }
}