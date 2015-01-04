var RestComponent = require('./restcomponent');
var async = require('async');

function Channel() {
    RestComponent.apply(this);

    var target = this;

    target.route.get(/detail\/(.*)$/, function(req, res) {
        var path = req.params[0];
        target.getItem(path, RestComponent.json.bind(res));
    }).get(/playstate\/(.*)$/, function(req, res) {
        var path = req.params[0];
        target.getLastPlayState(path, RestComponent.json.bind(res));
    }).put(/playstate\/(.*)$/, function(req, res) {
        var path = req.params[0];
        target.putPlayState(path, req.body, RestComponent.json.bind(res));
    }).get(/list\/(.*)$/, function(req, res) {
        var path = req.params[0];
        if(req.query.includePlayStates) {
            target.listContentsWithPlayStates(path, RestComponent.json.bind(res));
        } else {
            target.listContents(path, RestComponent.json.bind(res));
        }
    });

    this.listContentsWithPlayStates = function(path, cb) {
        target.listContents(path, function (err, contents) {
            async.map(contents, function (item, cb) {
                target.getLastPlayState(item.id, function (err, state) {
                    item.playState = state;
                    cb(err, item);
                });
            }, cb);
        });
    };
}

module.exports = Channel;