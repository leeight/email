define('er/ajax', [
    'require',
    './assert',
    './util',
    './Deferred',
    'eoo',
    'mini-event/EventTarget'
], function (require) {
    var TIMESTAMP_PARAM_KEY = '_';
    function serializeArray(prefix, array) {
        var encodedKey = prefix ? encodeURIComponent(prefix) : '';
        var encoded = [];
        for (var i = 0; i < array.length; i++) {
            var item = array[i];
            encoded[i] = this.serializeData('', item);
        }
        return encodedKey ? encodedKey + '=' + encoded.join(',') : encoded.join(',');
    }
    function serializeData(prefix, data) {
        if (arguments.length === 1) {
            data = prefix;
            prefix = '';
        }
        if (data == null) {
            data = '';
        }
        var getKey = this.serializeData.getKey;
        var encodedKey = prefix ? encodeURIComponent(prefix) : '';
        var type = Object.prototype.toString.call(data);
        switch (type) {
        case '[object Array]':
            return this.serializeArray(prefix, data);
        case '[object Object]':
            var result = [];
            for (var name in data) {
                var propertyKey = getKey(name, prefix);
                var propertyValue = this.serializeData(propertyKey, data[name]);
                result.push(propertyValue);
            }
            return result.join('&');
        default:
            return encodedKey ? encodedKey + '=' + encodeURIComponent(data) : encodeURIComponent(data);
        }
    }
    serializeData.getKey = function (propertyName, parentKey) {
        return parentKey ? parentKey + '.' + propertyName : propertyName;
    };
    var exports = {};
    exports.constructor = function () {
        this.hooks = {
            serializeData: serializeData,
            serializeArray: serializeArray
        };
        this.config = {
            cache: false,
            timeout: 0,
            charset: ''
        };
    };
    exports.request = function (options) {
        if (typeof this.hooks.beforeExecute === 'function') {
            this.hooks.beforeExecute(options);
        }
        var assert = require('./assert');
        assert.hasProperty(options, 'url', 'url property is required');
        var defaults = {
                method: 'POST',
                data: {},
                cache: this.config.cache,
                timeout: this.config.timeout,
                charset: this.config.charset
            };
        var util = require('./util');
        options = util.mix(defaults, options);
        var Deferred = require('./Deferred');
        var requesting = new Deferred();
        if (typeof this.hooks.beforeCreate === 'function') {
            var canceled = this.hooks.beforeCreate(options, requesting);
            if (canceled === true) {
                var fakeXHR = requesting.promise;
                fakeXHR.abort = function () {
                };
                fakeXHR.setRequestHeader = function () {
                };
                return fakeXHR;
            }
        }
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new window.ActiveXObject('Microsoft.XMLHTTP');
        util.mix(xhr, options.xhrFields);
        var fakeXHR = requesting.promise;
        var xhrWrapper = {
                abort: function () {
                    xhr.onreadystatechange = null;
                    try {
                        xhr.abort();
                    } catch (ex) {
                    }
                    if (!fakeXHR.status) {
                        fakeXHR.status = 0;
                    }
                    fakeXHR.readyState = xhr.readyState;
                    fakeXHR.responseText = '';
                    fakeXHR.responseXML = '';
                    requesting.reject(fakeXHR);
                },
                setRequestHeader: function (name, value) {
                    xhr.setRequestHeader(name, value);
                },
                getAllResponseHeaders: function () {
                    return xhr.getAllResponseHeaders();
                },
                getResponseHeader: function (name) {
                    return xhr.getResponseHeader(name);
                },
                getRequestOption: function (name) {
                    return options[name];
                }
            };
        util.mix(fakeXHR, xhrWrapper);
        var eventObject = {
                xhr: fakeXHR,
                options: options
            };
        fakeXHR.then(util.bind(this.fire, this, 'done', eventObject), util.bind(this.fire, this, 'fail', eventObject));
        var processRequestStatus = function () {
            if (xhr.readyState === 4) {
                var status = fakeXHR.status || xhr.status;
                if (status === 1223) {
                    status = 204;
                }
                fakeXHR.status = fakeXHR.status || status;
                fakeXHR.readyState = xhr.readyState;
                fakeXHR.responseText = xhr.responseText;
                fakeXHR.responseXML = xhr.responseXML;
                if (typeof this.hooks.afterReceive === 'function') {
                    this.hooks.afterReceive(fakeXHR, options);
                }
                if (status < 200 || status >= 300 && status !== 304) {
                    requesting.reject(fakeXHR);
                    return;
                }
                var data = xhr.responseText;
                if (options.dataType === 'json') {
                    try {
                        data = util.parseJSON(data);
                    } catch (ex) {
                        fakeXHR.error = ex;
                        requesting.reject(fakeXHR);
                        return;
                    }
                }
                if (typeof this.hooks.afterParse === 'function') {
                    try {
                        data = this.hooks.afterParse(data, fakeXHR, options);
                    } catch (ex) {
                        fakeXHR.error = ex;
                        requesting.reject(fakeXHR);
                        return;
                    }
                }
                requesting.resolve(data);
            }
        };
        xhr.onreadystatechange = util.bind(processRequestStatus, this);
        var method = options.method.toUpperCase();
        var data = {};
        if (method === 'GET') {
            util.mix(data, options.data);
        }
        if (options.cache === false) {
            data[TIMESTAMP_PARAM_KEY] = +new Date();
        }
        var query = this.hooks.serializeData('', data, 'application/x-www-form-urlencoded');
        var url = options.url;
        if (query) {
            var delimiter = url.indexOf('?') >= 0 ? '&' : '?';
            url += delimiter + query;
        }
        xhr.open(method, url, true);
        if (typeof this.hooks.beforeSend === 'function') {
            this.hooks.beforeSend(fakeXHR, options);
        }
        if (method === 'GET') {
            xhr.send();
        } else {
            var contentType = options.contentType || 'application/x-www-form-urlencoded';
            var query = this.hooks.serializeData('', options.data, contentType, fakeXHR);
            if (options.charset) {
                contentType += ';charset=' + options.charset;
            }
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.send(query);
        }
        if (options.timeout > 0) {
            var notifyTimeout = function () {
                this.fire('timeout', {
                    xhr: fakeXHR,
                    options: options
                });
                fakeXHR.status = 408;
                fakeXHR.abort();
            };
            var tick = setTimeout(util.bind(notifyTimeout, this), options.timeout);
            fakeXHR.ensure(function () {
                clearTimeout(tick);
            });
        }
        return fakeXHR;
    };
    exports.get = function (url, data, cache) {
        var options = {
                method: 'GET',
                url: url,
                data: data,
                cache: cache || this.config.cache
            };
        return this.request(options);
    };
    exports.getJSON = function (url, data, cache) {
        var options = {
                method: 'GET',
                url: url,
                data: data,
                dataType: 'json',
                cache: cache || this.config.cache
            };
        return this.request(options);
    };
    exports.post = function (url, data, dataType) {
        var options = {
                method: 'POST',
                url: url,
                data: data,
                dataType: dataType || 'json'
            };
        return this.request(options);
    };
    exports.log = function (url, data) {
        var img = new Image();
        var pool = window.ER_LOG_POOL || (window.ER_LOG_POOL = {});
        var id = +new Date();
        pool[id] = img;
        img.onload = img.onerror = img.onabort = function () {
            img.onload = img.onerror = img.onabort = null;
            pool[id] = null;
            img = null;
        };
        var query = this.hooks.serializeData('', data, 'application/x-www-form-urlencoded');
        if (query) {
            var delimiter = url.indexOf('?') >= 0 ? ':' : '?';
            url += delimiter + query;
        }
        img.src = url;
    };
    var Ajax = require('eoo').create(require('mini-event/EventTarget'), exports);
    var instance = new Ajax();
    instance.Ajax = Ajax;
    return instance;
});