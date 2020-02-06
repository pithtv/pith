import test from 'ava';
import {EventEmitter} from '../lib/events';

function setupHandlers(e, t, lastTestFinishes) {
    e.on("something", function (arg) {
        t.true(arg === "lalala", "First handler");
    }).on("something", function (arg) {
        t.true(true, "Second handler");
        if (lastTestFinishes) t.end();
    });
}

function setupFirstAsyncHandlers(e, t, lastTestFinishes, firstTestCancels) {
    e.on("something", function (arg, callback) {
        t.true(arg === "lalala", "First handler");
        callback(firstTestCancels);
        return this.ASYNC;
    }).on("something", function (arg) {
        t.true(true, "Second handler");
        if (lastTestFinishes) t.cb();
    });
}

test.cb("Test simple event emitter", function (t) {
    var e = new EventEmitter();
    setupHandlers(e, t, true);
    t.plan(2);
    e.emit("something", "lalala");
});

test.cb("emitAsync with synchronous handlers", function (t) {
    var e = new EventEmitter();
    setupHandlers(e, t, false);
    t.plan(3);
    e.emit("something", "lalala", function (cancelled) {
        t.true(!cancelled, "After event handler");
        t.end();
    });
});

test.cb("Async event cancelled", function (t) {
    var e = new EventEmitter();
    setupFirstAsyncHandlers(e, t, false, true);
    t.plan(2);
    e.emit("something", "lalala", function (cancelled) {
        t.true(cancelled, "event cancelled");
        t.end();
    });
});

test.cb("Async event without event handlers", function (t) {
    var e = new EventEmitter();
    e.emit("something", "lalalala", function (cancelled) {
        t.true(!cancelled, "no handlers so no cancel");
        t.end();
    })
});

test.cb("RemoveListener", function (t) {
    function handler1() {
        t.pass();
    }

    function handler2() {
        t.pass();
    }

    var e = new EventEmitter();
    e.on("lalala", handler1).on("lalala", handler2).removeListener("lalala", handler2);
    t.plan(1);
    e.emit("lalala", function () {
        t.end();
    });
});

test.cb("Once", function (t) {
    function handler1() {
        t.pass();
    }

    function handler2() {
        t.pass();
    }

    var e = new EventEmitter();
    e.on("lalala", handler1).once("lalala", handler2);
    t.plan(3);
    e.emit("lalala");
    e.emit("lalala", function () {
        t.end();
    });
});
