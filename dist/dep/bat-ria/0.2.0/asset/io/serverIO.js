define([
    'require',
    'er/ajax',
    'er/Deferred',
    'esui/Dialog',
    'underscore'
], function (require) {
    var ajax = require('er/ajax');
    var Deferred = require('er/Deferred');
    var Dialog = require('esui/Dialog');
    var u = require('underscore');
    var io = {};
    io.hooks = {};
    var CODE_MAP = {
            0: 'SUCCESS',
            1: 'GLOBAL',
            2: 'FIELD',
            3: 'REDIRECT',
            4: 'NO_SESSION'
        };
    var MINIMAL_CUSTOM_FAIL_CODE = 100;
    var SERVER_ERROR = getGlobalError('\u670D\u52A1\u5668\u9519\u8BEF');
    var PARSE_ERROR = getGlobalError('\u6570\u636E\u89E3\u6790\u5931\u8D25');
    var SCHEMA_ERROR = getGlobalError('\u6570\u636E\u683C\u5F0F\u9519\u8BEF');
    var UNKNOWN_ERROR = getGlobalError('\u672A\u77E5\u9519\u8BEF');
    function getGlobalError(message) {
        return {
            success: false,
            message: { global: message }
        };
    }
    function prepareResponse(data) {
        if (typeof data.code !== 'undefined') {
            var status = CODE_MAP[data.code];
            if (!status) {
                if (data.code < MINIMAL_CUSTOM_FAIL_CODE) {
                    return UNKNOWN_ERROR;
                } else {
                    var message = data.message || {};
                    message.code = data.code;
                    return {
                        success: false,
                        message: message
                    };
                }
            } else {
                if (status === 'SUCCESS') {
                    return {
                        success: true,
                        result: data.result
                    };
                } else {
                    return {
                        success: false,
                        message: data.message
                    };
                }
            }
        } else if (typeof data.success !== 'undefined') {
            return data;
        } else {
            return SCHEMA_ERROR;
        }
    }
    function gotoIndex() {
        var url = '/index.html';
        if (typeof io.hooks.filterIndexUrl === 'function') {
            url = io.hooks.filterIndexUrl(url) || url;
        }
        document.location.href = url;
    }
    function requestSuccessHandler(rawData) {
        var data = prepareResponse(rawData);
        if (typeof io.hooks.afterResponse === 'function') {
            data = io.hooks.afterResponse(data) || data;
        }
        if (data.success + '' !== 'true') {
            var message = data.message;
            var title;
            var content;
            var onok;
            var needAlert = true;
            if (typeof message.global !== 'undefined') {
                title = '\u7CFB\u7EDF\u63D0\u793A';
                content = message.global;
            } else if (typeof message.noSession !== 'undefined') {
                title = '\u7CFB\u7EDF\u8D85\u65F6';
                content = message.noSession;
                onok = gotoIndex;
            } else if (typeof message.redirect !== 'undefined') {
                if (message.redirect === '') {
                    title = '\u767B\u5F55\u8D85\u65F6';
                    content = '\u767B\u5F55\u8D85\u65F6\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\uFF01';
                    onok = function () {
                        window.location.reload(true);
                    };
                } else {
                    window.location.href = message.redirect;
                    return;
                }
            } else if (typeof message.field !== 'undefined' || typeof message.code !== 'undefined') {
                needAlert = false;
            } else {
                title = '\u7CFB\u7EDF\u63D0\u793A';
                content = '\u672A\u77E5\u9519\u8BEF';
            }
            if (needAlert) {
                Dialog.alert({
                    title: title,
                    content: content,
                    onok: onok
                });
            }
            if (typeof io.hooks.afterFailure === 'function') {
                message = io.hooks.afterFailure(message) || message;
            }
            message = requestCompleteHandler(message) || message;
            return Deferred.rejected(message);
        } else {
            if (typeof io.hooks.afterSuccess === 'function') {
                data = io.hooks.afterSuccess(data) || data;
            }
            var result = data.page || data.result;
            result = requestCompleteHandler(result) || result;
            return Deferred.resolved(result);
        }
    }
    function requestFailureHandler(fakeXHR) {
        var status = fakeXHR.status;
        var error;
        if (status < 200 || status >= 300 && status !== 304) {
            error = SERVER_ERROR;
        } else {
            error = PARSE_ERROR;
        }
        return requestSuccessHandler(error);
    }
    function requestCompleteHandler(data) {
        if (typeof io.hooks.afterComplete === 'function') {
            data = io.hooks.afterComplete(data) || data;
        }
        return data;
    }
    io.request = function (url, data, options) {
        var defaults = {
                url: url,
                data: data,
                dataType: 'json'
            };
        options = options ? u.defaults(options, defaults) : defaults;
        if (typeof io.hooks.beforeRequest === 'function') {
            options = io.hooks.beforeRequest(options) || options;
        }
        return ajax.request(options).then(requestSuccessHandler, requestFailureHandler);
    };
    io.get = function (url, data, options) {
        u.extend(options, { method: 'GET' });
        return this.request(url, data, options);
    };
    io.post = function (url, data, options) {
        u.extend(options, { method: 'POST' });
        return this.request(url, data, options);
    };
    return io;
});