define('esui/lib/lang', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var lib = {};
    var counter = 8785925;
    lib.getGUID = function (prefix) {
        prefix = prefix || 'esui';
        return prefix + counter++;
    };
    lib.inherits = function (subClass, superClass) {
        var Empty = function () {
        };
        Empty.prototype = superClass.prototype;
        var selfPrototype = subClass.prototype;
        var proto = subClass.prototype = new Empty();
        for (var key in selfPrototype) {
            proto[key] = selfPrototype[key];
        }
        subClass.prototype.constructor = subClass;
        subClass.superClass = superClass.prototype;
        return subClass;
    };
    lib.clone = function (source) {
        if (!source || typeof source !== 'object') {
            return source;
        }
        var result = source;
        if (u.isArray(source)) {
            result = u.clone(source);
        } else if ({}.toString.call(source) === '[object Object]' && 'isPrototypeOf' in source) {
            result = {};
            for (var key in source) {
                if (source.hasOwnProperty(key)) {
                    result[key] = lib.deepClone(source[key]);
                }
            }
        }
        return result;
    };
    lib.deepClone = lib.clone;
    lib.toDictionary = function (array) {
        var dictionary = {};
        u.each(array, function (value) {
            dictionary[value] = true;
        });
        return dictionary;
    };
    lib.isArray = u.isArray;
    lib.toArray = u.toArray;
    lib.extend = u.extend;
    lib.bind = u.bind;
    lib.curry = u.partial;
    lib.indexOf = u.indexOf;
    lib.decodeHTML = u.unescape;
    lib.encodeHTML = u.escape;
    return lib;
});