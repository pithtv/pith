const RestComponent = require('./restcomponent');

class Channel extends RestComponent {
    constructor() {
        super();
        const target = this;

        target.route.get(/detail\/(.*)$/, function (req, res, next) {
            const path = req.params[0];
            target.getItem(path).then(c => res.json(c)).catch(next);
        }).get(/playstate\/(.*)$/, function (req, res, next) {
            const path = req.params[0];
            target.getLastPlayState(path).then(c => res.json(c)).catch(next);
        }).put(/playstate\/(.*)$/, function (req, res, next) {
            const path = req.params[0];
            target.putPlayState(path, req.body).then(c => res.json(c)).catch(next);
        }).get(/list\/(.*)$/, function (req, res, next) {
            const path = req.params[0];
            if (req.query.includePlayStates) {
                target.listContentsWithPlayStates(path).then(c => res.json(c)).catch(next);
            } else {
                target.listContents(path).then(c => res.json(c)).catch(next);
            }
        }).get(/stream\/(.*)$/, function (req, res, next) {
            const path = req.params[0];
            target.getItem(path).then(item => {
                target.getStream(item, req.query).then(stream => {
                    res.json({
                        item: item,
                        stream: stream
                    });
                })
            }).catch(next);
        });

        /**
         * List contents, and include playstates in the result
         * @param path
         * @param cb
         */
        this.listContentsWithPlayStates = this.listContentsWithPlayStates || function (path) {
            return target.listContents(path).then((contents) =>
                Promise.all(contents.map(item =>
                    target.getLastPlayStateFromItem(item).then(state => {
                        item.playState = state;
                        return item;
                    })
                ))
            );
        };
    }
}

module.exports = Channel;