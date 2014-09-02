define('esui/lib/event', [
    'require',
    './dom',
    './page'
], function (require) {
    var dom = require('./dom');
    var page = require('./page').page;
    var event = {};
    event.preventDefault = function (event) {
        event = event || window.event;
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    };
    event.stopPropagation = function (event) {
        event = event || window.event;
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    };
    event.getMousePosition = function (event) {
        event = event || window.event;
        if (typeof event.pageX !== 'number') {
            event.pageX = event.clientX + page.getScrollLeft() - page.getClientLeft();
        }
        if (typeof event.pageY !== 'number') {
            event.pageY = event.clientY + page.getScrollTop() - page.getClientTop();
        }
        return event;
    };
    event.getTarget = function (event) {
        event = event || window.event;
        return event.target || event.srcElement;
    };
    return {
        on: function (element, type, listener) {
            element = dom.g(element);
            if (element.addEventListener) {
                element.addEventListener(type, listener, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + type, listener);
            }
        },
        un: function (element, type, listener) {
            element = dom.g(element);
            if (element.addEventListener) {
                element.removeEventListener(type, listener, false);
            } else if (element.attachEvent) {
                element.detachEvent('on' + type, listener);
            }
        },
        event: event
    };
});