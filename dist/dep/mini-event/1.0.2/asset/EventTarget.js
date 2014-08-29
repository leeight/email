define('mini-event/EventTarget', [
    'require',
    './lib',
    './Event',
    './EventQueue'
], function (require) {
    var lib = require('./lib');
    var Event = require('./Event');
    var EventQueue = require('./EventQueue');
    function EventTarget() {
    }
    EventTarget.prototype.on = function (type, fn, thisObject, options) {
        if (!this.miniEventPool) {
            this.miniEventPool = {};
        }
        if (!this.miniEventPool.hasOwnProperty(type)) {
            this.miniEventPool[type] = new EventQueue();
        }
        var queue = this.miniEventPool[type];
        options = lib.extend({}, options);
        if (thisObject) {
            options.thisObject = thisObject;
        }
        queue.add(fn, options);
    };
    EventTarget.prototype.once = function (type, fn, thisObject, options) {
        options = lib.extend({}, options);
        options.once = true;
        this.on(type, fn, thisObject, options);
    };
    EventTarget.prototype.un = function (type, handler, thisObject) {
        if (!this.miniEventPool || !this.miniEventPool.hasOwnProperty(type)) {
            return;
        }
        var queue = this.miniEventPool[type];
        queue.remove(handler, thisObject);
    };
    EventTarget.prototype.fire = function (type, args) {
        if (arguments.length === 1 && typeof type === 'object') {
            args = type;
            type = args.type;
        }
        if (!type) {
            throw new Error('No event type specified');
        }
        if (type === '*') {
            throw new Error('Cannot fire global event');
        }
        var event = args instanceof Event ? args : new Event(type, args);
        event.target = this;
        var inlineHandler = this['on' + type];
        if (typeof inlineHandler === 'function') {
            inlineHandler.call(this, event);
        }
        if (this.miniEventPool && this.miniEventPool.hasOwnProperty(type)) {
            var queue = this.miniEventPool[type];
            queue.execute(event, this);
        }
        if (this.miniEventPool && this.miniEventPool.hasOwnProperty('*')) {
            var globalQueue = this.miniEventPool['*'];
            globalQueue.execute(event, this);
        }
        return event;
    };
    EventTarget.prototype.destroyEvents = function () {
        if (!this.miniEventPool) {
            return;
        }
        for (var name in this.miniEventPool) {
            if (this.miniEventPool.hasOwnProperty(name)) {
                this.miniEventPool[name].dispose();
            }
        }
        this.miniEventPool = null;
    };
    EventTarget.enable = function (target) {
        target.miniEventPool = {};
        lib.extend(target, EventTarget.prototype);
    };
    return EventTarget;
});