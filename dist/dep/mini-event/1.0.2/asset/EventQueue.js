define('mini-event/EventQueue', [
    'require',
    './lib'
], function (require) {
    var lib = require('./lib');
    function isContextIdentical(context, handler, thisObject) {
        return context && context.handler === handler && context.thisObject == thisObject;
    }
    function EventQueue() {
        this.queue = [];
    }
    EventQueue.prototype.add = function (handler, options) {
        if (handler !== false && typeof handler !== 'function') {
            throw new Error('event handler must be a function or const false');
        }
        var wrapper = { handler: handler };
        lib.extend(wrapper, options);
        for (var i = 0; i < this.queue.length; i++) {
            var context = this.queue[i];
            if (isContextIdentical(context, handler, wrapper.thisObject)) {
                return;
            }
        }
        this.queue.push(wrapper);
    };
    EventQueue.prototype.remove = function (handler, thisObject) {
        if (!handler) {
            this.clear();
            return;
        }
        for (var i = 0; i < this.queue.length; i++) {
            var context = this.queue[i];
            if (isContextIdentical(context, handler, thisObject)) {
                this.queue[i] = null;
                return;
            }
        }
    };
    EventQueue.prototype.clear = function () {
        this.queue.length = 0;
    };
    EventQueue.prototype.execute = function (event, thisObject) {
        var queue = this.queue;
        for (var i = 0; i < queue.length; i++) {
            if (typeof event.isImmediatePropagationStopped === 'function' && event.isImmediatePropagationStopped()) {
                return;
            }
            var context = queue[i];
            if (!context) {
                continue;
            }
            var handler = context.handler;
            if (handler === false) {
                if (typeof event.preventDefault === 'function') {
                    event.preventDefault();
                }
                if (typeof event.stopPropagation === 'function') {
                    event.stopPropagation();
                }
            } else {
                handler.call(context.thisObject || thisObject, event);
            }
            if (context.once) {
                this.remove(context.handler, context.thisObject);
            }
        }
    };
    EventQueue.prototype.getLength = function () {
        var count = 0;
        for (var i = 0; i < this.queue.length; i++) {
            if (this.queue[i]) {
                count++;
            }
        }
        return count;
    };
    EventQueue.prototype.length = EventQueue.prototype.getLength;
    EventQueue.prototype.dispose = function () {
        this.clear();
        this.queue = null;
    };
    return EventQueue;
});