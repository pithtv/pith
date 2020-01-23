const log4js = require("log4js");
log4js.configure({
    appenders: {
        console: {
            type: 'console'
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'trace'
        }
    }
});

require("./lib/global")(function(err, Global) {
    const {Pith} = require("./pith.js");
    const rest = require("./lib/pithrest.js").handle;
    const express = require("express");
    const http = require("http");
    const ws = require("ws");
    const scaler = require("./lib/imagescaler");
    const bodyparser = require("body-parser");
    const logger = log4js.getLogger("pith");
    const path = require('path');


    process.on('uncaughtException', function(err) {
        // handle the error safely
        logger.error(err);
    });

    // workaround
    Object.defineProperty(http.IncomingMessage.prototype, "upgrade", {
        get() {
            return "connection" in this.headers && "upgrade" in this.headers && this.headers.connection.startsWith("Upgrade") && this.headers.upgrade.toLowerCase() === 'websocket';
        },
        set(v) {
        }
    });

    Global.OpenDatabase(
        function startup(err, db) {
            if(err) {
                throw err;
            }

            const serverAddress = Global.bindAddress;
            const port = Global.httpPort;
            const pithPath = Global.settings.pithContext;

            logger.info("Listening on http://" + serverAddress + ":" + port);

            const pithApp = new Pith({
                rootUrl: Global.rootUrl + "/pith/",
                rootPath: pithPath,
                db: db
            });

            const app = express();

            app.use(bodyparser.json());

            app.set('x-powered-by', false);

            app.use(pithPath, pithApp.handle);
            app.use(Global.settings.apiContext, rest(pithApp));
            app.use("/webui", express.static(path.resolve(__dirname, "..", "webui", "dist")));
            app.use("/scale", scaler.handle);

            // exclude all private members in JSON messages (those starting with underscore)
            function jsonReplacer(k,v) {
                if(k.charAt(0) === '_') return undefined;
                else return v;
            }

            app.set("json replacer", jsonReplacer);

            const server = new http.Server(app);

            server.listen(port, serverAddress);
            server.listen(port);

            const wss = new ws.Server({server: server});

            wss.on('connection', function(ws) {
                const listeners = [];
                ws.on('message', function(data) {
                    try {
                        const message = JSON.parse(data);
                        switch(message.action) {
                        case 'on':
                            const listener = function () {
                                try {
                                    ws.send(JSON.stringify({
                                        event: message.event,
                                        arguments: Array.prototype.slice.apply(arguments)
                                    }, jsonReplacer));
                                } catch (e) {
                                    logger.error(e);
                                }
                            };
                            listeners.push({event: message.event, listener: listener});
                                pithApp.on(message.event, listener);
                                break;
                        }
                    } catch(e) {
                        logger.error("Error processing event message", data, e);
                    }
                });
                ws.on('close', function() {
                    logger.debug("Client disconnected, cleaning up listeners");
                    listeners.forEach(function(e) {
                        pithApp.removeListener(e.event, e.listener);
                    });
                });
            });

            app.use((req, res, next) => {
                res.redirect('/webui/');
            });
        }
    );
});
