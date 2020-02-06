import {EventEmitter} from '../src/lib/events';

function setupHandlers(e, done = () => {}) {
    e.on("something", function (arg) {
        expect(arg === "lalala").toBe(true);
    }).on("something", function (arg) {
        expect(true).toBe(true);
        done();
    });
}

test("Test simple event emitter", function (done) {
    var e = new EventEmitter();
    setupHandlers(e, done);
    expect.assertions(2);
    e.emit("something", "lalala");
});

test("emitAsync with synchronous handlers", function (done) {
    var e = new EventEmitter();
    setupHandlers(e);
    expect.assertions(3);
    e.emit("something", "lalala", function (cancelled) {
        expect(!cancelled).toBe(true);
        done();
    });
});

test("Async event cancelled", function (done) {
    var e = new EventEmitter();

    e.on("something", function (arg, callback) {
        expect(arg === "lalala").toBe(true);
        callback(true);
        return this.ASYNC;
    }).on("something", function (arg) {
        expect(true).toBe(true);
    });

    expect.assertions(2);
    e.emit("something", "lalala", function (cancelled) {
        expect(cancelled).toBe(true);
        done();
    });
});

test("Async event without event handlers", function (done) {
    var e = new EventEmitter();
    e.emit("something", "lalalala", function (cancelled) {
        expect(!cancelled).toBe(true);
        done();
    })
});

test("RemoveListener", function (done) {
    function handler1() {
        expect(true).toBeTruthy();
    }

    function handler2() {
        expect(true).toBeTruthy();
    }

    var e = new EventEmitter();
    e.on("lalala", handler1).on("lalala", handler2).removeListener("lalala", handler2);
    expect.assertions(1);
    e.emit("lalala", function () {
        done();
    });
});

test("Once", function (done) {
    function handler1() {
        expect(true).toBeTruthy();
    }

    function handler2() {
        expect(true).toBeTruthy();
    }

    var e = new EventEmitter();
    e.on("lalala", handler1).once("lalala", handler2);
    expect.assertions(3);
    e.emit("lalala");
    e.emit("lalala", function () {
        done();
    });
});
