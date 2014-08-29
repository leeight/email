define('esui/lib/dom', [
    'require',
    'underscore',
    './string'
], function (require) {
    var u = require('underscore');
    var string = require('./string');
    var lib = {};
    lib.g = function (id) {
        if (!id) {
            return null;
        }
        return typeof id === 'string' ? document.getElementById(id) : id;
    };
    lib.isInput = function (element) {
        var nodeName = element.nodeName.toLowerCase();
        return nodeName === 'input' || nodeName === 'select' || nodeName === 'textarea';
    };
    lib.removeNode = function (element) {
        if (typeof element === 'string') {
            element = lib.g(element);
        }
        if (!element) {
            return;
        }
        var parent = element.parentNode;
        if (parent) {
            parent.removeChild(element);
        }
    };
    lib.insertAfter = function (element, reference) {
        var parent = reference.parentNode;
        if (parent) {
            parent.insertBefore(element, reference.nextSibling);
        }
        return element;
    };
    lib.insertBefore = function (element, reference) {
        var parent = reference.parentNode;
        if (parent) {
            parent.insertBefore(element, reference);
        }
        return element;
    };
    lib.getChildren = function (element) {
        return u.filter(element.children, function (child) {
            return child.nodeType === 1;
        });
    };
    lib.getComputedStyle = function (element, key) {
        if (!element) {
            return '';
        }
        var doc = element.nodeType == 9 ? element : element.ownerDocument || element.document;
        if (doc.defaultView && doc.defaultView.getComputedStyle) {
            var styles = doc.defaultView.getComputedStyle(element, null);
            if (styles) {
                return styles[key] || styles.getPropertyValue(key);
            }
        } else if (element && element.currentStyle) {
            return element.currentStyle[key];
        }
        return '';
    };
    lib.getStyle = function (element, key) {
        key = string.camelize(key);
        return element.style[key] || (element.currentStyle ? element.currentStyle[key] : '') || lib.getComputedStyle(element, key);
    };
    lib.getOffset = function (element) {
        var rect = element.getBoundingClientRect();
        var offset = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        var clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
        var clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        offset.top = offset.top + scrollTop - clientTop;
        offset.bottom = offset.bottom + scrollTop - clientTop;
        offset.left = offset.left + scrollLeft - clientLeft;
        offset.right = offset.right + scrollLeft - clientLeft;
        return offset;
    };
    lib.getText = function (element) {
        var text = '';
        if (element.nodeType === 3 || element.nodeType === 4) {
            text += element.nodeValue;
        } else if (element.nodeType !== 8) {
            u.each(element.childNodes, function (child) {
                text += lib.getText(child);
            });
        }
        return text;
    };
    lib.dom = {};
    lib.dom.first = function (element) {
        element = lib.g(element);
        if (element.firstElementChild) {
            return element.firstElementChild;
        }
        var node = element.firstChild;
        for (; node; node = node.nextSibling) {
            if (node.nodeType == 1) {
                return node;
            }
        }
        return null;
    };
    lib.dom.last = function (element) {
        element = lib.g(element);
        if (element.lastElementChild) {
            return element.lastElementChild;
        }
        var node = element.lastChild;
        for (; node; node = node.previousSibling) {
            if (node.nodeType === 1) {
                return node;
            }
        }
        return null;
    };
    lib.dom.next = function (element) {
        element = lib.g(element);
        if (element.nextElementSibling) {
            return element.nextElementSibling;
        }
        var node = element.nextSibling;
        for (; node; node = node.nextSibling) {
            if (node.nodeType == 1) {
                return node;
            }
        }
        return null;
    };
    lib.dom.contains = function (container, contained) {
        container = lib.g(container);
        contained = lib.g(contained);
        return container.contains ? container != contained && container.contains(contained) : !!(container.compareDocumentPosition(contained) & 16);
    };
    return lib;
});