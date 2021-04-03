import {PithPlugin, plugin} from "../plugins";
import express from "express";
import path from "path";
import {Pith} from "../../pith";

@plugin()
export default class WebUIPlugin implements PithPlugin {
    async init({pith}: {pith: Pith}) {
        pith.express.use('/webui', express.static(path.resolve(__dirname, '..', '..', '..', 'webui', 'dist'), {fallthrough: true}));
        pith.express.all('/webui/*', (req, res, next) => res.sendFile('index.html', { root: path.resolve(__dirname, '..', '..', '..', 'webui', 'dist') }))
        pith.express.use(/\/$/, (req, res, next) => {
            res.redirect('/webui/');
        });
    }
}
