define([
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var util = {};
    util.purify = function purify(object, defaults, deep) {
        defaults = defaults || {};
        var purifiedObject = {};
        u.each(object, function (value, key) {
            var isDefaultNull = value == null || value === '';
            var isInDefaults = defaults.hasOwnProperty(key) && defaults[key] === value;
            if (!isDefaultNull && !isInDefaults) {
                if (deep && typeof value === 'object') {
                    purifiedObject[key] = purify(value, defaults[key], deep);
                } else {
                    purifiedObject[key] = value;
                }
            }
        });
        return purifiedObject;
    };
    util.filterObject = function (obj, predicate, context) {
        var result = {};
        if (obj == null) {
            return result;
        }
        u.each(obj, function (value, key) {
            if (predicate.call(context, value, key, obj)) {
                result[key] = value;
            }
        });
        return result;
    };
    util.mapObject = function (obj, iterator, context) {
        var result = {};
        if (obj == null) {
            return result;
        }
        u.each(obj, function (value, key) {
            result[key] = iterator.call(context, value);
        });
        return result;
    };
    util.mapKey = function (obj, map) {
        var result = {};
        if (obj == null) {
            return result;
        }
        u.each(obj, function (value, key) {
            if (map[key]) {
                result[map[key]] = value;
            } else {
                result[key] = value;
            }
        });
        return result;
    };
    util.trim = function (s) {
        return s.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
    util.pascalize = function (s) {
        s = s + '';
        if (/^[A-Z\-_]+$/.test(s)) {
            s = s.toLowerCase();
        }
        s = s.replace(/[\s-_]+(.)/g, function (w, c) {
            return c.toUpperCase();
        });
        s = s.charAt(0).toUpperCase() + s.slice(1);
        return s;
    };
    util.camelize = function (s) {
        s = util.pascalize(s);
        return s.charAt(0).toLowerCase() + s.slice(1);
    };
    util.dasherize = function (s) {
        s = util.pascalize(s);
        s = s.replace(/[A-Z]{2,}/g, function (match) {
            return match.charAt(0) + match.slice(1, -1).toLowerCase() + match.charAt(match.length - 1);
        });
        s = s.replace(/[A-Z]/g, function (match) {
            return '-' + match.toLowerCase();
        });
        if (s.charAt(0) === '-') {
            s = s.substring(1);
        }
        return s;
    };
    util.constanize = function (s) {
        s = util.pascalize(s);
        return s.toUpperCase();
    };
    util.pluralize = function (s) {
        return s.replace(/y$/, 'ie') + 's';
    };
    util.formatNumber = function (number, decimals, emptyValue, prefix) {
        if (typeof arguments[1] !== 'number') {
            prefix = arguments[2];
            emptyValue = arguments[1];
            decimals = 0;
        }
        prefix = prefix || '';
        emptyValue = emptyValue || '';
        if (number == null || isNaN(number)) {
            return prefix + emptyValue;
        }
        number = parseFloat(number).toFixed(decimals);
        var parts = number.split('.');
        var integer = parts[0];
        var decimal = parts[1];
        integer = integer.replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
        var result = prefix + integer;
        if (decimal) {
            result += '.' + decimal;
        }
        return result;
    };
    util.pad = function (s, padding, length) {
        s = s + '';
        var padLength = length - s.length;
        if (padLength > 0) {
            var left = new Array(padLength + 1).join(padding);
            return left + s;
        } else {
            return s;
        }
    };
    util.padRight = function (s, padding, length) {
        s = s + '';
        var padLength = length - s.length;
        if (padLength > 0) {
            var right = new Array(padLength + 1).join(padding);
            return s + right;
        } else {
            return s;
        }
    };
    util.deepClone = function (obj) {
        if (!u.isObject(obj) || u.isFunction(obj)) {
            return obj;
        }
        if (u.isArray(obj)) {
            return u.map(obj, util.deepClone);
        }
        var clone = {};
        u.each(obj, function (value, key) {
            clone[key] = util.deepClone(value);
        });
        return clone;
    };
    util.typeOf = function (value) {
        return Object.prototype.toString.call(value).slice(8, -1);
    };
    function activate() {
        u.mixin(util);
    }
    return { activate: u.once(activate) };
});