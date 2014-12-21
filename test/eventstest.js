var EventEmitter = require("../lib/events");

function setupHandlers(e, test, lastTestFinishes) {
    e.on("something", function(arg) {
        test.ok(arg === "lalala", "First handler");
    }).on("something", function(arg) {
        test.ok(true, "Second handler");
        if(lastTestFinishes) test.done();
    });
}

function setupFirstAsyncHandlers(e, test, lastTestFinishes, firstTestCancels) {
    e.on("something", function(arg, callback) {
        test.ok(arg === "lalala", "First handler");
        callback(firstTestCancels);
        return this.ASYNC;
    }).on("something", function(arg) {
        test.ok(true, "Second handler");
        if(lastTestFinishes) test.done();
    });
}

module.exports = {
    "Test simple event emitter": function(test) {
        var e = new EventEmitter();
        setupHandlers(e, test, true);
        test.expect(2);
        e.emit("something", "lalala");
    },

    "emitAsync with synchronous handlers": function(test) {
        var e = new EventEmitter();
        setupHandlers(e, test);
        test.expect(3);
        e.emit("something", "lalala", function(cancelled) {
            test.ok(!cancelled, "After event handler");
            test.done();
        });
    },

    "Async event cancelled": function(test) {
        var e = new EventEmitter();
        setupFirstAsyncHandlers(e, test, false, true);
        test.expect(2);
        e.emit("something", "lalala", function(cancelled) {
            test.ok(cancelled, "event cancelled");
            test.done();
        });
    },

    "Async event without event handlers": function(test) {
        var e = new EventEmitter();
        e.emit("something", "lalalala", function(cancelled) {
            test.ok(!cancelled, "no handlers so no cancel");
            test.done();
        })
    },

    "RemoveListener": function(test) {
        function handler1() {
            test.ok(true);
        }
        function handler2() {
            test.ok(true);
        }
        var e = new EventEmitter();
        e.on("lalala", handler1).on("lalala",handler2).removeListener("lalala", handler2);
        test.expect(1);
        e.emit("lalala", function() {
            test.done();
        });
    },

    "Once": function(test) {
        function handler1() {
            test.ok(true);
        }
        function handler2() {
            test.ok(true);
        }
        var e = new EventEmitter();
        e.on("lalala", handler1).once("lalala",handler2);
        test.expect(3);
        e.emit("lalala");
        e.emit("lalala", function() {
            test.done();
        });
    }
};