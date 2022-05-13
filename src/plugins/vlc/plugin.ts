import {PithPlugin, plugin} from "../plugins";
import {Pith} from "../../pith";
import {VlcDiscovery} from "./VlcDiscovery";
import {VlcClient} from "./VlcClient";
import {getLogger} from "log4js";

const logger = getLogger('pith.plugin.vlc-client');

@plugin()
export default class VlcClientPlugin implements PithPlugin {
  init(opts: { pith: Pith }): Promise<void> | void {
    const discovery = new VlcDiscovery();
    discovery.on('serviceUp', (client: VlcClient) => {
      logger.info(`VideoLAN Client found at ${client.address}:${client.port}`)
      opts.pith.registerPlayer(client);
      client.connect();
    });
    discovery.on('serviceDown', (client: VlcClient) => {
      opts.pith.unregisterPlayer(client);
    });
    discovery.start();
  }
}
