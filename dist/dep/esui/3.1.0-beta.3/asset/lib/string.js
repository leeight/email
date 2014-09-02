define('esui/lib/string', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var lib = {};
    var WHITESPACE = /^[\s\xa0\u3000]+|[\u3000\xa0\s]+$/g;
    lib.trim = function (source) {
        if (!source) {
            return '';
        }
        return String(source).replace(WHITESPACE, '');
    };
    lib.format = function (template, data) {
        if (!template) {
            return '';
        }
        if (data == null) {
            return template;
        }
        return template.replace(/\$\{(.+?)\}/g, function (match, key) {
            var replacer = data[key];
            if (typeof replacer === 'function') {
                replacer = replacer(key);
            }
            return replacer == null ? '' : replacer;
        });
    };
    lib.camelize = function (source) {
        if (!source) {
            return '';
        }
        return source.replace(/-([a-z])/g, function (alpha) {
            return alpha.toUpperCase();
        });
    };
    lib.pascalize = function (source) {
        if (!source) {
            return '';
        }
        return source.charAt(0).toUpperCase() + lib.camelize(source.slice(1));
    };
    lib.splitTokenList = function (input) {
        if (!input) {
            return [];
        }
        if (u.isArray(input)) {
            return;
        }
        return u.chain(input.split(/[,\s]/)).map(lib.trim).compact().value();
    };
    return lib;
});