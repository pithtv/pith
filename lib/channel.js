var RestComponent = require('./restcomponent');
var async = require('../lib/async');

function Channel() {
    RestComponent.apply(this);

    var target = this;

    target.route.get(/detail\/(.*)$/, function(req, res, next) {
        var path = req.params[0];
        target.getItem(path).then(c => res.json(c)).catch(next);
    }).get(/playstate\/(.*)$/, function(req, res) {
        var path = req.params[0];
        target.getLastPlayState(path, RestComponent.json.bind(res));
    }).put(/playstate\/(.*)$/, function(req, res) {
        var path = req.params[0];
        target.putPlayState(path, req.body, RestComponent.json.bind(res));
    }).get(/list\/(.*)$/, function(req, res, next) {
        var path = req.params[0];
        if(req.query.includePlayStates) {
            target.listContentsWithPlayStates(path).then(c => res.json(c)).catch(next);
        } else {
            target.listContents(path).then(c => res.json(c)).catch(next);
        }
    });

    /**
     * List contents, and include playstates in the result
     * @param path
     * @param cb
     */
    this.listContentsWithPlayStates = this.listContentsWithPlayStates || function(path) {
        return target.listContents(path).then((contents) =>
            async.map(contents, (item, cb) => {
                target.getLastPlayState(item.id, function (err, state) {
                    item.playState = state;
                    cb(err, item);
                });
            })
        );
    };
}

module.exports = Channel;