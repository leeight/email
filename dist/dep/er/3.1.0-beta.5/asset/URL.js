define('er/URL', [
    'require',
    './util',
    'eoo'
], function (require) {
    var util = require('./util');
    var exports = {};
    exports.constructor = function (path, search, searchSeparator) {
        path = path || '/';
        search = search || '';
        searchSeparator = searchSeparator || '~';
        this.toString = function () {
            return search ? path + searchSeparator + search : path;
        };
        this.getPath = function () {
            return path;
        };
        this.getSearch = function () {
            return search;
        };
        var query = null;
        this.getQuery = function (key) {
            if (!query) {
                query = URL.parseQuery(search);
            }
            return key ? query[key] : util.mix({}, query);
        };
    };
    exports.compare = function (another) {
        if (typeof another === 'string') {
            another = URL.parse(another);
        }
        var result = {};
        var thisPath = this.getPath();
        var anotherPath = another.getPath();
        if (thisPath === anotherPath) {
            result.path = false;
        } else {
            result.path = {
                key: 'path',
                self: thisPath,
                other: anotherPath
            };
        }
        var thisQuery = this.getQuery();
        var anotherQuery = another.getQuery();
        var queryDifferenceIndex = {};
        var queryDifference = [];
        var hasQueryDifference = false;
        for (var key in thisQuery) {
            if (thisQuery.hasOwnProperty(key)) {
                var thisValue = thisQuery[key];
                var anotherValue = anotherQuery[key];
                if (thisValue !== anotherValue) {
                    hasQueryDifference = true;
                    var diff = {
                            key: key,
                            self: thisValue,
                            other: anotherValue
                        };
                    queryDifference.push(diff);
                    queryDifferenceIndex[key] = diff;
                }
            }
        }
        for (var key in anotherQuery) {
            if (anotherQuery.hasOwnProperty(key) && !thisQuery.hasOwnProperty(key)) {
                hasQueryDifference = true;
                var diff = {
                        key: key,
                        self: undefined,
                        other: anotherQuery[key]
                    };
                queryDifference.push(diff);
                queryDifferenceIndex[key] = diff;
            }
        }
        result.queryDifference = queryDifference;
        result.query = hasQueryDifference ? queryDifferenceIndex : false;
        return result;
    };
    var URL = require('eoo').create(exports);
    URL.parse = function (url, options) {
        var defaults = { querySeparator: '~' };
        options = util.mix(defaults, options);
        var querySeparatorIndex = url.indexOf(options.querySeparator);
        if (querySeparatorIndex >= 0) {
            return new URL(url.slice(0, querySeparatorIndex), url.slice(querySeparatorIndex + 1), options.querySeparator);
        } else {
            return new URL(url, '', options.querySeparator);
        }
    };
    URL.withQuery = function (path, query, options) {
        path = path + '';
        var defaults = { querySeparator: '~' };
        options = util.mix(defaults, options);
        var separator = path.indexOf(options.querySeparator) < 0 ? options.querySeparator : '&';
        var search = URL.serialize(query);
        var url = path + separator + search;
        return URL.parse(url, options);
    };
    URL.parseQuery = function (str) {
        var pairs = str.split('&');
        var query = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];
            if (!pair) {
                continue;
            }
            var index = pair.indexOf('=');
            var key = index < 0 ? decodeURIComponent(pair) : decodeURIComponent(pair.slice(0, index));
            var value = index < 0 ? true : decodeURIComponent(pair.slice(index + 1));
            if (query.hasOwnProperty(key)) {
                if (value !== true) {
                    query[key] = [].concat(query[key], value);
                }
            } else {
                query[key] = value;
            }
        }
        return query;
    };
    URL.serialize = function (query) {
        if (!query) {
            return '';
        }
        var search = '';
        for (var key in query) {
            if (query.hasOwnProperty(key)) {
                var value = query[key];
                search += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value);
            }
        }
        return search.slice(1);
    };
    URL.empty = new URL();
    return URL;
});