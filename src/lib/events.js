class EventEmitter {
    constructor() {
        this.ASYNC = {};
    }

    on(event, when, handler) {
        let key;
        if (typeof when === 'function') {
            handler = when;
            key = event;
        } else {
            key = event + "#" + when;
        }
        if (this.eventHandlers === undefined) {
            this.eventHandlers = {};
        }
        if (this.eventHandlers[key] === undefined) {
            this.eventHandlers[key] = [handler];
        } else {
            this.eventHandlers[key].unshift(handler);
        }

        return this;
    }

    once(event, when, handler) {
        let key;
        if (typeof when === 'function') {
            handler = when;
            key = event;
        } else {
            key = event + "#" + when;
        }

        const handleOnce = () => {
            handler.apply(this, arguments);
            this.removeListener(event, handleOnce);
        };

        return this.on(key, handleOnce);
    }

    removeListener(event, listener) {
        const h = this.eventHandlers && this.eventHandlers[event];
        if (h) {
            const idx = h.indexOf(listener);
            if (idx > -1) {
                h.splice(idx, 1);
            }
        }
    }

    removeAllListeners(event) {
        if (this.eventHandlers) {
            this.eventHandlers[event] = undefined;
        }
    }

    emit(event, any, callback) {
        let handlers = this.eventHandlers && this.eventHandlers[event];
        let lastArg = arguments[arguments.length - 1];
        callback = (typeof lastArg === 'function') ? lastArg : undefined;
        let args = Array.prototype.slice.apply(arguments, [1, arguments.length - (callback ? 1 : 0)]);

        const self = this;
        if (!handlers) {
            callback && callback(false);
        } else {
            handlers = handlers.slice(0); //copy array
            function next(cancelled) {
                if (cancelled) {
                    callback && callback(true);
                } else {
                    const handler = handlers.pop();
                    if (!handler) {
                        callback && callback(false);
                    } else {
                        const r = handler.apply(self, args.concat([next]));
                        if (r !== self.ASYNC) {
                            next(false);
                        }
                    }
                }
            }

            next(false);
        }
    }
}


module.exports = EventEmitter;
