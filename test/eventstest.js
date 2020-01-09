const test = require('ava');
const EventEmitter = require("../lib/events");

function setupHandlers(e, test, lastTestFinishes) {
    e.on("something", function (arg) {
        test.true(arg === "lalala", "First handler");
    }).on("something", function (arg) {
        test.true(true, "Second handler");
        if (lastTestFinishes) test.end();
    });
}

function setupFirstAsyncHandlers(e, test, lastTestFinishes, firstTestCancels) {
    e.on("something", function (arg, callback) {
        test.true(arg === "lalala", "First handler");
        callback(firstTestCancels);
        return this.ASYNC;
    }).on("something", function (arg) {
        test.true(true, "Second handler");
        if (lastTestFinishes) test.cb();
    });
}

test.cb("Test simple event emitter", function (test) {
    var e = new EventEmitter();
    setupHandlers(e, test, true);
    test.plan(2);
    e.emit("something", "lalala");
});

test.cb("emitAsync with synchronous handlers", function (test) {
    var e = new EventEmitter();
    setupHandlers(e, test);
    test.plan(3);
    e.emit("something", "lalala", function (cancelled) {
        test.true(!cancelled, "After event handler");
        test.end();
    });
});

test.cb("Async event cancelled", function (test) {
    var e = new EventEmitter();
    setupFirstAsyncHandlers(e, test, false, true);
    test.plan(2);
    e.emit("something", "lalala", function (cancelled) {
        test.true(cancelled, "event cancelled");
        test.end();
    });
});

test.cb("Async event without event handlers", function (test) {
    var e = new EventEmitter();
    e.emit("something", "lalalala", function (cancelled) {
        test.true(!cancelled, "no handlers so no cancel");
        test.end();
    })
});

test.cb("RemoveListener", function (test) {
    function handler1() {
        test.pass();
    }

    function handler2() {
        test.pass();
    }

    var e = new EventEmitter();
    e.on("lalala", handler1).on("lalala", handler2).removeListener("lalala", handler2);
    test.plan(1);
    e.emit("lalala", function () {
        test.end();
    });
});

test.cb("Once", function (test) {
    function handler1() {
        test.pass();
    }

    function handler2() {
        test.pass();
    }

    var e = new EventEmitter();
    e.on("lalala", handler1).once("lalala", handler2);
    test.plan(3);
    e.emit("lalala");
    e.emit("lalala", function () {
        test.end();
    });
});
