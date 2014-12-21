function EventEmitter() {

};

EventEmitter.prototype = {
    on: function(event, when, handler) {
        var key;
        if(typeof when === 'function') {
            handler = when;
            key = event;
        } else {
            key = event + "#" + when;
        }
        if(this.eventHandlers === undefined) {
            this.eventHandlers = {};
        }
        if(this.eventHandlers[key] === undefined) {
            this.eventHandlers[key] = [handler];
        } else {
            this.eventHandlers[key].unshift(handler);
        }

        return this;
    },

    once: function(event, when, handler) {
        var key;
        if(typeof when === 'function') {
            handler = when;
            key = event;
        } else {
            key = event + "#" + when;
        }

        function handleOnce() {
            handler.apply(this, arguments);
            this.removeListener(event, handleOnce);
        }

        return this.on(key, handleOnce);
    },

    removeListener: function(event, listener) {
        var h = this.eventHandlers && this.eventHandlers[event];
        if(h) {
            var idx = h.indexOf(listener);
            if(idx > -1) {
                h.splice(idx, 1);
            }
        }
    },

    removeAllListeners: function(event) {
      if(this.eventHandlers) {
          this.eventHandlers[event] = undefined;
      }
    },

    emit: function(event, any, callback) {
        var handlers = this.eventHandlers && this.eventHandlers[event];
        var lastArg = arguments[arguments.length - 1],
            callback = (typeof lastArg === 'function') ? lastArg : undefined,
            args = Array.prototype.slice.apply(arguments, [1, arguments.length - (callback ? 1 : 0)]);

        var self = this;
        if(!handlers) {
            callback && callback(false);
        } else {
            handlers = handlers.slice(0); //copy array
            function next(cancelled) {
                if(cancelled) {
                    callback && callback(true);
                } else {
                    var handler = handlers.pop();
                    if (!handler) {
                        callback && callback(false);
                    } else {
                        var r = handler.apply(self, args.concat([next]));
                        if(r !== self.ASYNC) {
                            next(false);
                        }
                    }
                }
            }
            next(false);
        }
    },

    pointcut: function(event, pointcut) {
        this.emitAndWait(event, Array.prototype.slice.apply(arguments, [2]), function(cancelled) {
            pointcut(cancelled);
            if(!cancelled) {
                this.emit(event + "#after", Array.prototype(arguments, 2));
            }
        });
        return this;
    },

    ASYNC: new Object()
};

module.exports = EventEmitter;