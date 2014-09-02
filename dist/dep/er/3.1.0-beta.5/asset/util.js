define('er/util', [], function () {
    var now = +new Date();
    var util = {};
    util.guid = function () {
        return 'er' + now++;
    };
    util.mix = function (source) {
        for (var i = 1; i < arguments.length; i++) {
            var destination = arguments[i];
            if (!destination) {
                continue;
            }
            for (var key in destination) {
                if (destination.hasOwnProperty(key)) {
                    source[key] = destination[key];
                }
            }
        }
        return source;
    };
    var nativeBind = Function.prototype.bind;
    util.bind = nativeBind ? function (fn) {
        return nativeBind.apply(fn, [].slice.call(arguments, 1));
    } : function (fn, context) {
        var extraArgs = [].slice.call(arguments, 2);
        return function () {
            var args = extraArgs.concat([].slice.call(arguments));
            return fn.apply(context, args);
        };
    };
    util.noop = function () {
    };
    var dontEnumBug = !{ toString: 1 }.propertyIsEnumerable('toString');
    util.inherits = function (type, superType) {
        var Empty = function () {
        };
        Empty.prototype = superType.prototype;
        var proto = new Empty();
        var originalPrototype = type.prototype;
        type.prototype = proto;
        for (var key in originalPrototype) {
            proto[key] = originalPrototype[key];
        }
        if (dontEnumBug) {
            if (originalPrototype.hasOwnProperty('toString')) {
                proto.toString = originalPrototype.toString;
            }
            if (originalPrototype.hasOwnProperty('valueOf')) {
                proto.valueOf = originalPrototype.valueOf;
            }
        }
        type.prototype.constructor = type;
        return type;
    };
    util.parseJSON = function (text) {
        if (!text) {
            return undefined;
        }
        if (window.JSON && typeof JSON.parse === 'function') {
            return JSON.parse(text);
        } else {
            return new Function('return (' + text + ');')();
        }
    };
    var whitespace = /(^[\s\t\xa0\u3000]+)|([\u3000\xa0\s\t]+$)/g;
    util.trim = function (source) {
        return source.replace(whitespace, '');
    };
    util.encodeHTML = function (source) {
        source = source + '';
        return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    };
    util.getElement = function (element) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        return element;
    };
    return util;
});