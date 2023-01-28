import {inject, injectable} from "tsyringe"
import {SettingsStore, SettingsStoreSymbol} from "./settings/SettingsStore"
import {DBDriver, DBDriverSymbol} from "./persistence/DBDriver"
import {ImageScaler} from "./lib/imagescaler"
import {Global} from "./lib/global"
import {Pith} from "./pith"
import path from "path"
import log4js from "log4js"
import Fastify, {FastifyInstance} from "fastify"
import fastifyWs from "@fastify/websocket"
import {fastifyStatic} from "@fastify/static"
import {pithRest} from "./lib/pithrest"

const logger = log4js.getLogger('pith')

@injectable()
export class Bootstrap {
  constructor(
      @inject(SettingsStoreSymbol) private settingsStore: SettingsStore,
      @inject(DBDriverSymbol) private dbDriver: DBDriver,
      @inject(ImageScaler) private imageScaler: ImageScaler,
      @inject(Global) private global: Global) {
  }

  async startup() {
    await this.settingsStore.load()

    await this.dbDriver.open()

    const serverAddress = this.global.bindAddress
    const port = this.global.httpPort
    const rootPath = this.settingsStore.settings.pithContext

    const fastify = Fastify({logger: true}) as FastifyInstance
    fastify.register(fastifyWs)

    logger.info('Listening on http://' + serverAddress + ':' + port)

    const pithApp = new Pith({
      rootUrl: this.global.rootUrl + '/pith/',
      rootPath,
      fastify
    })

    pithApp.load()

    fastify.register(fastifyStatic, {
      prefix: '/icons',
      root: path.resolve(__dirname, '..', 'icons')
    })

    fastify.register(this.imageScaler.route, {
      prefix: '/scale'
    })

    fastify.register(pithRest(pithApp), {
      prefix: this.settingsStore.settings.apiContext
    })

    // exclude all private members in JSON messages (those starting with underscore)
    function jsonReplacer(k, v) {
      if (k.charAt(0) === '_') {
        return undefined;
      } else {
        return v;
      }
    }

    fastify.register(async function(fastify) {
      fastify.get('/events', {websocket: true}, (connection, req) => {
        const listeners = []

        try {
          connection.socket.on('message', data => {
            try {
              const message = JSON.parse(data.toString())
              switch (message.action) {
                case 'on':
                  const listener = (...args) => {
                    try {
                      connection.socket.send(JSON.stringify({
                        event: message.event,
                        arguments: args
                      }, jsonReplacer))
                    } catch (e) {
                      logger.error(e)
                    }
                  }
                  listeners.push({event: message.event, listener})
                  pithApp.on(message.event, listener)
                  break
              }
            } catch (e) {
              logger.error('Error processing event message', data, e)
            }
          })
          connection.socket.on('close', () => {
            logger.debug('Client disconnected, cleaning up listeners')
            listeners.forEach((e) => {
              pithApp.removeListener(e.event, e.listener)
            })
          })
        } catch(e) {
          logger.error("Error establishing WebSocket connection", e)
        }
      })
    })

    return fastify.listen({port, host: serverAddress})
  }
}
