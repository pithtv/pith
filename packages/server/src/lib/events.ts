export type EventHandler = (...args: any[]) => void;

export interface IEventEmitter {
    on(event, handler: EventHandler);
    on(event, when, handler: EventHandler);
    once(event, when, handler: EventHandler);
    once(event, handler: EventHandler);

    removeListener(event, listener): void;

    removeAllListeners(event): void;

    emit(event, otherArgs, callback?: (cancelled?: boolean) => void): void;
}

export class EventEmitter implements IEventEmitter {
    private ASYNC: {} = {};
    private eventHandlers: {[eventName: string]: EventHandler[]};
    public on(event, handler: EventHandler);
    public on(event, when, handler: EventHandler);
    public on(event, when?, handler?: EventHandler) {
        let key;
        if (typeof when === "function") {
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

    public once(event, when, handler: EventHandler);
    public once(event, handler: EventHandler);
    public once(event, when?, handler?: EventHandler) {
        let key;
        if (typeof when === "function") {
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

    public removeListener(event, listener) {
        const h = this.eventHandlers && this.eventHandlers[event];
        if (h) {
            const idx = h.indexOf(listener);
            if (idx > -1) {
                h.splice(idx, 1);
            }
        }
    }

    public removeAllListeners(event) {
        if (this.eventHandlers) {
            this.eventHandlers[event] = undefined;
        }
    }

    public emit(event, otherArgs?, callback?: (cancelled?: boolean) => void) {
        let handlers = this.eventHandlers && this.eventHandlers[event];
        const lastArg = arguments[arguments.length - 1];
        callback = (typeof lastArg === "function") ? lastArg : undefined;
        const args = Array.prototype.slice.apply(arguments, [1, arguments.length - (callback ? 1 : 0)]);

        const self = this;
        if (!handlers) {
            if (callback) {
                callback(false);
            }
        } else {
            handlers = handlers.slice(0); // copy array
            function next(cancelled) {
                if (cancelled) {
                    if (callback) {
                        callback(true);
                    }
                } else {
                    const handler = handlers.pop();
                    if (!handler) {
                        if (callback) {
                            callback(false);
                        }
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
