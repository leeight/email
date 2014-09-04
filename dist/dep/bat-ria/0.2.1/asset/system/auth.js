define('bat-ria/system/auth', [
    'require',
    'underscore'
], function (require) {
    var u = require('underscore');
    var auth = {};
    var AuthType = {
            NONE: 'none',
            EDITABLE: 'editable',
            READONLY: 'readonly',
            MIXED: '-'
        };
    auth.AuthType = AuthType;
    auth.get = function (authName, authMap) {
        var filter;
        if (/^\(.+\)$/.test(authName)) {
            return auth.get(authName.substr(1, authName.length - 2), authMap);
        }
        var authNames = [];
        if (/^(\w+):/.test(authName)) {
            var authPattern = /^(?:(\w+):)(.+)$/;
            var arr = authPattern.exec(authName);
            if (!arr) {
                throw 'Auth error: [' + authName + '] is not a valid auth expression.';
            }
            filter = arr[1];
            var paramStr = arr[2].replace(/^[\s,|]+|[\s,|]+$/g, '');
            var cache = [];
            var bracketCount = 0;
            for (var i = 0; i < paramStr.length; i++) {
                var ch = paramStr.charAt(i);
                if (ch === '(') {
                    if (bracketCount === 0 && cache.length) {
                        throw 'Auth error: [' + authName + '] is not a valid auth expression.';
                    }
                    if (++bracketCount === 1) {
                        continue;
                    }
                } else if (ch === ')') {
                    if (--bracketCount <= 0) {
                        var brachketContent = cache.join('');
                        authNames.push(auth.get(brachketContent, authMap).toUpperCase());
                        cache = [];
                        continue;
                    }
                } else if (bracketCount <= 0 && (ch === ',' || ch === '|' || /\s/.test(ch))) {
                    if (cache.length) {
                        authNames.push(cache.join(''));
                        cache = [];
                    }
                    continue;
                }
                cache.push(ch);
            }
            if (cache.length) {
                authNames.push(cache.join(''));
            }
            if (bracketCount > 0) {
                throw 'Auth error: [' + authName + '] brackets doesn\'t match.';
            }
        } else {
            authNames = [u.trim(authName)];
        }
        var types = [];
        u.each(authNames, function (name) {
            if (u.contains(u.keys(AuthType), name)) {
                types.push(AuthType[name]);
                return true;
            }
            var nameSpaces = name.split('.');
            do {
                var type = authMap[nameSpaces.join('.')];
                if (type) {
                    types.push(type);
                    return true;
                }
                nameSpaces.pop();
            } while (nameSpaces.length);
            throw 'Auth error: [' + name + '] not found.';
        });
        if (filter) {
            return filters[filter].call(null, types.length > 1 ? types : types[0]);
        } else {
            return types[0];
        }
    };
    auth.permit = function (authName, authMap) {
        return auth.get(authName, authMap) !== AuthType.NONE;
    };
    var filters = {
            rtoe: function (type) {
                return type === AuthType.READONLY ? AuthType.EDITABLE : type;
            },
            rton: function (type) {
                return type === AuthType.READONLY ? AuthType.NONE : type;
            },
            ntor: function (type) {
                return type === AuthType.NONE ? AuthType.READONLY : type;
            },
            up: function (type) {
                return type === AuthType.NONE ? AuthType.READONLY : AuthType.EDITABLE;
            },
            max: function (types) {
                var max = AuthType.NONE;
                u.each(types, function (type) {
                    if (type === AuthType.EDITABLE) {
                        max = type;
                        return false;
                    } else if (type === AuthType.READONLY) {
                        max = type;
                    }
                });
                return max;
            },
            min: function (types) {
                var min = AuthType.EDITABLE;
                u.each(types, function (type) {
                    if (type === AuthType.NONE) {
                        min = type;
                        return false;
                    } else if (type === AuthType.READONLY) {
                        min = type;
                    }
                });
                return min;
            }
        };
    auth.registerFilter = function (name, filter) {
        filters[name] = filter;
    };
    return auth;
});