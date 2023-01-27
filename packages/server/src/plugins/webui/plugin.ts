import {PithPlugin, plugin} from "../plugins";
import {Pith} from "../../pith";
import webUiPath from "@pithmediaserver/pith-webui";
import {fastifyStatic} from "@fastify/static";

@plugin()
export default class WebUIPlugin implements PithPlugin {
    async init({pith}: {pith: Pith}) {
        pith.fastify.register(fastifyStatic, {
            prefix: '/webui',
            root: webUiPath,
            decorateReply: false
        })

        pith.fastify.setNotFoundHandler({
        }, function (request, reply) {
            reply.sendFile('index.html', webUiPath)
        });

        pith.fastify.get('/', (req, reply) => reply.redirect('/webui/'))
    }
}
