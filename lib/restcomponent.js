var express = require('express');

function json(err, result) {
    if(err) {
        this.status(500);
        this.json(err);
    } else {
        this.json(result);
    }
}

function RestComponent(target) {
    if(target !== undefined) {
        RestComponent.apply(target);
        return;
    }

    var router = express.Router();

    this.route = router;
}

RestComponent.json = json;

module.exports = RestComponent;