define('mini-event/Event', [
    'require',
    './lib'
], function (require) {
    var lib = require('./lib');
    function returnTrue() {
        return true;
    }
    function returnFalse() {
        return false;
    }
    function isObject(target) {
        return Object.prototype.toString.call(target) === '[object Object]';
    }
    function Event(type, args) {
        if (typeof type === 'object') {
            args = type;
            type = args.type;
        }
        if (isObject(args)) {
            lib.extend(this, args);
        } else if (args) {
            this.data = args;
        }
        if (type) {
            this.type = type;
        }
    }
    Event.prototype.isDefaultPrevented = returnFalse;
    Event.prototype.preventDefault = function () {
        this.isDefaultPrevented = returnTrue;
    };
    Event.prototype.isPropagationStopped = returnFalse;
    Event.prototype.stopPropagation = function () {
        this.isPropagationStopped = returnTrue;
    };
    Event.prototype.isImmediatePropagationStopped = returnFalse;
    Event.prototype.stopImmediatePropagation = function () {
        this.isImmediatePropagationStopped = returnTrue;
        this.stopPropagation();
    };
    var globalWindow = function () {
            return this;
        }();
    Event.fromDOMEvent = function (domEvent, type, args) {
        domEvent = domEvent || globalWindow.event;
        var event = new Event(type, args);
        event.preventDefault = function () {
            if (domEvent.preventDefault) {
                domEvent.preventDefault();
            } else {
                domEvent.returnValue = false;
            }
            Event.prototype.preventDefault.call(this);
        };
        event.stopPropagation = function () {
            if (domEvent.stopPropagation) {
                domEvent.stopPropagation();
            } else {
                domEvent.cancelBubble = true;
            }
            Event.prototype.stopPropagation.call(this);
        };
        event.stopImmediatePropagation = function () {
            if (domEvent.stopImmediatePropagation) {
                domEvent.stopImmediatePropagation();
            }
            Event.prototype.stopImmediatePropagation.call(this);
        };
        return event;
    };
    var EVENT_PROPERTY_BLACK_LIST = {
            type: true,
            target: true,
            preventDefault: true,
            isDefaultPrevented: true,
            stopPropagation: true,
            isPropagationStopped: true,
            stopImmediatePropagation: true,
            isImmediatePropagationStopped: true
        };
    Event.fromEvent = function (originalEvent, options) {
        var defaults = {
                type: originalEvent.type,
                preserveData: false,
                syncState: false
            };
        options = lib.extend(defaults, options);
        var newEvent = new Event(options.type);
        if (options.preserveData) {
            for (var key in originalEvent) {
                if (originalEvent.hasOwnProperty(key) && !EVENT_PROPERTY_BLACK_LIST.hasOwnProperty(key)) {
                    newEvent[key] = originalEvent[key];
                }
            }
        }
        if (options.extend) {
            lib.extend(newEvent, options.extend);
        }
        if (options.syncState) {
            newEvent.preventDefault = function () {
                originalEvent.preventDefault();
                Event.prototype.preventDefault.call(this);
            };
            newEvent.stopPropagation = function () {
                originalEvent.stopPropagation();
                Event.prototype.stopPropagation.call(this);
            };
            newEvent.stopImmediatePropagation = function () {
                originalEvent.stopImmediatePropagation();
                Event.prototype.stopImmediatePropagation.call(this);
            };
        }
        return newEvent;
    };
    Event.delegate = function (from, fromType, to, toType, options) {
        var useDifferentType = typeof fromType === 'string';
        var source = {
                object: from,
                type: useDifferentType ? fromType : to
            };
        var target = {
                object: useDifferentType ? to : fromType,
                type: useDifferentType ? toType : to
            };
        var config = useDifferentType ? options : toType;
        config = lib.extend({ preserveData: false }, config);
        if (typeof source.object.on !== 'function' || typeof target.object.on !== 'function' || typeof target.object.fire !== 'function') {
            return;
        }
        var delegator = function (originalEvent) {
            var event = Event.fromEvent(originalEvent, config);
            event.type = target.type;
            event.target = target.object;
            target.object.fire(target.type, event);
        };
        source.object.on(source.type, delegator);
    };
    return Event;
});