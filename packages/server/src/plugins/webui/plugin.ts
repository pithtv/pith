import {PithPlugin, plugin} from "../plugins";
import express from "express";
import path from "path";
import {Pith} from "../../pith";
import webUiPath from "@pithmediaserver/pith-webui";

@plugin()
export default class WebUIPlugin implements PithPlugin {
    async init({pith}: {pith: Pith}) {
        pith.express.use('/webui', express.static(webUiPath, {fallthrough: true}));
        pith.express.all('/webui/*', (req, res, next) => res.sendFile('index.html', { root: webUiPath }))
        pith.express.use(/\/$/, (req, res, next) => {
            res.redirect('/webui/');
        });
    }
}
