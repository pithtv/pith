import bonjour from "bonjour";
import fetch from 'node-fetch';
import {EventEmitter} from "events";
import {VlcClient} from "./VlcClient";
import {getLogger} from "log4js";

const logger = getLogger('pith.plugin.VlcClient');

export class VlcDiscovery extends EventEmitter {
  private clients: VlcClient[] = [];
  start() {
    // @ts-ignore
    const bj = new bonjour();
    const browser = bj.find({type: "http"})
    browser.on("up", (evt) => {
      this.probe(evt.addresses, evt.port, evt.name);
    });
    browser.on("down", (evt) => {
      this.collect(evt.addresses, evt.port);
    })
    browser.start();
  }

  private async probe(addresses: string[], port: number, name: string) {
    for(const addr of addresses) {
      try {
        logger.debug(`Probing ${addr}:${port} to see if it's a controllable VLC instance`);
        const response = await fetch(`http://${addr}:${port}/playerControl.js`);
        if(response.status === 200) {
          logger.debug(`Found VLC at ${addr}:${port}`);
          this.notify(addr, port, name);
          return;
        } else {
          logger.debug(`${addr}:${port} not recognized as a VLC instance: ${response.statusText}`)
        }
      } catch(e) {
        logger.warn(`Got an error trying to resolve ${addr}:${port} as a VLC client`, e);
      }
    }
  }

  private collect(addresses: string[], port: number) {
    const clientIdx = this.clients.findIndex(c => addresses?.includes(c.address) && port === c.port);
    if(clientIdx < 0) return;
    const client = this.clients.splice(clientIdx, 1)[0];
    this.emit('serviceDown', client);
  }

  notify(addr: string, port: number, name: string) {
    const client = new VlcClient(addr, port, name);
    this.clients.push(client);
    this.emit('serviceUp', client);
  }
}
