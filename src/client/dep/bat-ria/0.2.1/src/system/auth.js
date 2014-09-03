/**
 * @file 权限验证相关功能
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {

    var u = require('underscore');

    var auth = {};

    /**
     * 权限类型
     *
     * @enum {string}
     */
    var AuthType = {
        NONE: 'none',
        EDITABLE: 'editable',
        READONLY: 'readonly',
        MIXED: '-'
    };

    auth.AuthType = AuthType;

    /**
     * 获取某个权限模块在某个权限集合中的权限类型
     * @param {string} authName 权限模块的名字
     * @param {Object} authMap 权限模块集合
     * @return {AuthType} 返回权限类型
     */
    auth.get = function(authName, authMap) {

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
            var paramStr = arr[2].replace(/^[\s,|]+|[\s,|]+$/g, ''); // trim
            var cache = [];
            var bracketCount = 0;
            for (var i = 0; i < paramStr.length; i++) {
                var ch = paramStr.charAt(i);
                if (ch === '(') {
                    if (bracketCount === 0 && cache.length) { // 括号前有非分隔字符，非法
                        throw 'Auth error: [' + authName + '] is not a valid auth expression.';
                    }
                    if (++bracketCount === 1) { // 最外层第一个括号丢弃
                        continue;
                    }
                }
                else if (ch === ')') {
                    // 最外层括号结束，取出整个括号内的内容递归调用
                    if (--bracketCount <= 0) {
                        var brachketContent = cache.join('');
                        authNames.push(auth.get(brachketContent, authMap).toUpperCase());
                        cache = [];
                        continue;
                    }
                }
                else if (bracketCount <= 0 // 不在括号内的内容，碰到分隔字符，将cache里的字符作为一个完整的authName
                    && (ch === ','
                        || ch === '|'
                        || /\s/.test(ch)
                    )
                ) {
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
        }
        else {
            authNames = [u.trim(authName)];
        }

        var types = [];
        u.each(authNames, function(name) {

            // 如果是权限类型关键字作为直接量，不需要查询模块
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
            return filters[filter].call(
                null, types.length > 1 ? types : types[0]
            );
        }
        else {
            return types[0];
        }
    };

    /**
     * 获取某个权限模块在某个权限集合中是否有基本权限
     * @param {string} authName 权限模块的名字
     * @param {Object} authMap 权限模块集合
     * @return {boolean} 是否可见
     */
    auth.permit = function(authName, authMap) {
        return auth.get(authName, authMap) !== AuthType.NONE;
    };

    /**
     * 已经注册的权限类型转换器
     * @type {Object.<string, Function>}
     * @private
     */
    var filters = {
        rtoe: function(type) {
            return type === AuthType.READONLY
                   ? AuthType.EDITABLE
                   : type;
        },

        rton: function(type) {
            return type === AuthType.READONLY
                   ? AuthType.NONE
                   : type;
        },

        ntor: function(type) {
            return type === AuthType.NONE
                   ? AuthType.READONLY
                   : type;
        },

        up: function(type) {
            return type === AuthType.NONE
                   ? AuthType.READONLY
                   : AuthType.EDITABLE;
        },

        max: function(types) {
            var max = AuthType.NONE;
            u.each(types, function(type) {
                if (type === AuthType.EDITABLE) {
                    max = type;
                    return false;
                }
                else if (type === AuthType.READONLY) {
                    max = type;
                }
            });
            return max;
        },

        min: function(types) {
            var min = AuthType.EDITABLE;
            u.each(types, function(type) {
                if (type === AuthType.NONE) {
                    min = type;
                    return false;
                }
                else if (type === AuthType.READONLY) {
                    min = type;
                }
            });
            return min;
        }
    };

    /**
     * 注册新的权限类型转换器
     * @param {string} name 转换器名字
     * @param {function(AuthType)} filter 转换器处理函数
     */
    auth.registerFilter = function(name, filter) {
        filters[name] = filter;
    };

    return auth;
});
