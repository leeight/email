define('esui/helper/event', [
    'require',
    'underscore',
    'mini-event/EventQueue',
    '../lib',
    'mini-event'
], function (require) {
    var DOM_EVENTS_KEY = '_esuiDOMEvent';
    var globalEvents = {
            window: {},
            document: {},
            documentElement: {},
            body: {}
        };
    var u = require('underscore');
    var EventQueue = require('mini-event/EventQueue');
    var lib = require('../lib');
    var helper = {};
    function getGlobalEventPool(element) {
        if (element === window) {
            return globalEvents.window;
        }
        if (element === document) {
            return globalEvents.document;
        }
        if (element === document.documentElement) {
            return globalEvents.documentElement;
        }
        if (element === document.body) {
            return globalEvents.body;
        }
        return null;
    }
    function triggerGlobalDOMEvent(element, e) {
        var pool = getGlobalEventPool(element);
        if (!pool) {
            return;
        }
        var queue = pool[e.type];
        if (!queue) {
            return;
        }
        u.each(queue, function (control) {
            triggerDOMEvent(control, element, e);
        });
    }
    function debounce(fn, interval) {
        interval = interval || 150;
        var timer = 0;
        return function (e) {
            clearTimeout(timer);
            var self = this;
            e = e || window.event;
            e = {
                type: e.type,
                srcElement: e.srcElement,
                target: e.target,
                currentTarget: e.currentTarget
            };
            timer = setTimeout(function () {
                fn.call(self, e);
            }, interval);
        };
    }
    function addGlobalDOMEvent(control, type, element) {
        var pool = getGlobalEventPool(element);
        if (!pool) {
            return false;
        }
        var controls = pool[type];
        if (!controls) {
            controls = pool[type] = [];
            var handler = u.partial(triggerGlobalDOMEvent, element);
            if (type === 'resize' || type === 'scroll') {
                handler = debounce(handler);
            }
            controls.handler = handler;
            lib.on(element, type, controls.handler);
        }
        if (u.indexOf(controls, control) >= 0) {
            return;
        }
        controls.push(control);
        return true;
    }
    function removeGlobalDOMEvent(control, type, element) {
        var pool = getGlobalEventPool(element);
        if (!pool) {
            return false;
        }
        if (!pool[type]) {
            return true;
        }
        var controls = pool[type];
        for (var i = 0; i < controls.length; i++) {
            if (controls[i] === control) {
                controls.splice(i, 1);
                break;
            }
        }
        if (!controls.length) {
            var handler = controls.handler;
            lib.un(element, type, handler);
            pool[type] = null;
        }
        return true;
    }
    function triggerDOMEvent(control, element, e) {
        e = e || window.event;
        var isInIgnoringState = u.any(control.ignoreStates, function (state) {
                return control.hasState(state);
            });
        if (isInIgnoringState) {
            return;
        }
        if (!e.target) {
            e.target = e.srcElement;
        }
        if (!e.currentTarget) {
            e.currentTarget = element;
        }
        if (!e.preventDefault) {
            e.preventDefault = function () {
                e.returnValue = false;
            };
        }
        if (!e.stopPropagation) {
            e.stopPropagation = function () {
                e.cancelBubble = true;
            };
        }
        var queue = control.domEvents[e.currentTarget[DOM_EVENTS_KEY]][e.type];
        if (!queue) {
            return;
        }
        queue.execute(e, control);
    }
    helper.addDOMEvent = function (element, type, handler) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        if (!this.control.domEvents) {
            this.control.domEvents = {};
        }
        var guid = element[DOM_EVENTS_KEY];
        if (!guid) {
            guid = element[DOM_EVENTS_KEY] = lib.getGUID();
        }
        var events = this.control.domEvents[guid];
        if (!events) {
            events = this.control.domEvents[guid] = { element: element };
        }
        var isGlobal = addGlobalDOMEvent(this.control, type, element);
        var queue = events[type];
        if (!queue) {
            queue = events[type] = new EventQueue();
            if (!isGlobal) {
                queue.handler = u.partial(triggerDOMEvent, this.control, element);
                lib.on(element, type, queue.handler);
            }
        }
        queue.add(handler);
    };
    helper.delegateDOMEvent = function (element, type, newType) {
        var handler = function (e) {
            var event = require('mini-event').fromDOMEvent(e);
            this.fire(newType || e.type, event);
            if (event.isDefaultPrevented()) {
                lib.event.preventDefault(e);
            }
            if (event.isPropagationStopped()) {
                lib.event.stopPropagation(e);
            }
        };
        this.addDOMEvent(element, type, handler);
    };
    helper.removeDOMEvent = function (element, type, handler) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        if (!this.control.domEvents) {
            return;
        }
        var guid = element[DOM_EVENTS_KEY];
        var events = this.control.domEvents[guid];
        if (!events || !events[type]) {
            return;
        }
        if (!handler) {
            events[type].clear();
        } else {
            var queue = events[type];
            queue.remove(handler);
            if (!queue.getLength()) {
                removeGlobalDOMEvent(this.control, type, element);
            }
        }
    };
    helper.clearDOMEvents = function (element) {
        if (typeof element === 'string') {
            element = this.getPart(element);
        }
        if (!this.control.domEvents) {
            return;
        }
        if (!element) {
            u.each(u.pluck(this.control.domEvents, 'element'), this.clearDOMEvents, this);
            this.control.domEvents = null;
            return;
        }
        var guid = element[DOM_EVENTS_KEY];
        var events = this.control.domEvents[guid];
        delete events.element;
        u.each(events, function (queue, type) {
            var isGlobal = removeGlobalDOMEvent(this.control, type, element);
            if (!isGlobal) {
                var handler = queue.handler;
                queue.dispose();
                queue.handler = null;
                lib.un(element, type, handler);
            }
        }, this);
        delete this.control.domEvents[guid];
    };
    return helper;
});