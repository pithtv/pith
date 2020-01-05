const express = require('express');

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

    this.route = express.Router();
}

RestComponent.json = json;

module.exports = RestComponent;
