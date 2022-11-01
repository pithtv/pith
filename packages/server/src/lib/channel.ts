import {IChannel} from "../channel";
import {RestComponent} from "./restcomponent";
import {IChannelItem, IPlayState} from "@pithmediaserver/api";
import {StreamDescriptor} from "@pithmediaserver/api/types/stream";

export abstract class Channel extends RestComponent implements IChannel {
    public id: string;

    protected constructor() {
        super();
        this.route.get(/detail\/(.*)$/, (req, res, next) => {
            const path = req.params[0];
            this.getItem(path).then((c) => res.json(c)).catch(next);
        }).get(/playstate\/(.*)$/, (req, res, next) => {
            const path = req.params[0];
            this.getLastPlayState(path).then((c) => res.json(c)).catch(next);
        }).put(/playstate\/(.*)$/, (req, res, next) => {
            const path = req.params[0];
            this.putPlayState(path, req.body).then((c) => res.json(c)).catch(next);
        }).get(/list\/(.*)$/, (req, res, next) => {
            const path = req.params[0];
            this.listContents(path).then((c) => res.json(c)).catch(next);
        }).get(/stream\/(.*)$/, (req, res, next) => {
            const path = req.params[0];
            this.getItem(path).then((item) => {
                return this.getStream(item, req.query).then((stream) => {
                    res.json({
                        item,
                        stream,
                    });
                });
            }).catch(err => {
                next(err)
            });
        }).get(/redirect\/(.*)$/, async (req, res, next) => {
            const path = req.params[0];
            const item = await this.getItem(path);
            const stream = await this.getStream(item);
            res.redirect(stream.url);
        });
    }

    public abstract listContents(containerId: string): Promise<IChannelItem[]>;

    public abstract getLastPlayState(itemId: string): Promise<IPlayState>;

    public abstract putPlayState(itemId: string, state: IPlayState): Promise<void>;

    public abstract getItem(itemId: string, detailed?: boolean): Promise<IChannelItem>;

    public abstract getLastPlayStateFromItem(item: IChannelItem): Promise<IPlayState>;

    public abstract getStream(item: IChannelItem, opts?: any): Promise<StreamDescriptor>;
}
