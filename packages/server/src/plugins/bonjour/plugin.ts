import {PithPlugin, plugin} from "../plugins";
import * as ciao from "@homebridge/ciao";
import {Pith} from "../../pith";
import {inject, injectable} from "tsyringe";
import {Global} from "../../lib/global";

@plugin()
@injectable()
export default class BonjourPlugin implements PithPlugin {
  constructor(@inject(Global) private global: Global) {
  }

  init(opts: {pith: Pith}) {
    const responder = ciao.getResponder();
    const service = responder.createService({
      name: "Pith",
      type: "pith",
      port: this.global.httpPort,
      txt: {
        pithService: "/"
      }
    });
    service.advertise();
  }
}
