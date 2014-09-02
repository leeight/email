define('esui/lib/class', [
    'require',
    'underscore',
    './dom'
], function (require) {
    var u = require('underscore');
    var dom = require('./dom');
    var lib = {};
    function getClassList(element) {
        return element.className ? element.className.split(/\s+/) : [];
    }
    lib.hasClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return false;
        }
        if (element.classList) {
            return element.classList.contains(className);
        }
        var classes = getClassList(element);
        return u.contains(classes, className);
    };
    lib.addClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return element;
        }
        if (element.classList) {
            element.classList.add(className);
            return element;
        }
        var classes = getClassList(element);
        if (u.contains(classes, className)) {
            return element;
        }
        classes.push(className);
        element.className = classes.join(' ');
        return element;
    };
    lib.addClasses = function (element, classes) {
        element = dom.g(element);
        if (!element || !classes) {
            return element;
        }
        if (element.classList) {
            u.each(classes, function (className) {
                element.classList.add(className);
            });
            return element;
        }
        var originalClasses = getClassList(element);
        var newClasses = u.union(originalClasses, classes);
        if (newClasses.length > originalClasses.length) {
            element.className = newClasses.join(' ');
        }
        return element;
    };
    lib.removeClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return element;
        }
        if (element.classList) {
            element.classList.remove(className);
            return element;
        }
        var classes = getClassList(element);
        var changed = false;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                i--;
                changed = true;
            }
        }
        if (changed) {
            element.className = classes.join(' ');
        }
        return element;
    };
    lib.removeClasses = function (element, classes) {
        element = dom.g(element);
        if (!element || !classes) {
            return element;
        }
        if (element.classList) {
            u.each(classes, function (className) {
                element.classList.remove(className);
            });
            return element;
        }
        var originalClasses = getClassList(element);
        var newClasses = u.difference(originalClasses, classes);
        if (newClasses.length < originalClasses.length) {
            element.className = newClasses.join(' ');
        }
        return element;
    };
    lib.toggleClass = function (element, className) {
        element = dom.g(element);
        if (className === '') {
            throw new Error('className must not be empty');
        }
        if (!element || !className) {
            return element;
        }
        if (element.classList) {
            element.classList.toggle(className);
            return element;
        }
        var classes = getClassList(element);
        var containsClass = false;
        for (var i = 0; i < classes.length; i++) {
            if (classes[i] === className) {
                classes.splice(i, 1);
                containsClass = true;
                i--;
            }
        }
        if (!containsClass) {
            classes.push(className);
        }
        element.className = classes.join(' ');
        return element;
    };
    return lib;
});