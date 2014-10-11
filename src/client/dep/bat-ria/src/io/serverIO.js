/**
 * @file 请求发送器
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var ajax = require('er/ajax');
    var Deferred = require('er/Deferred');
    var Dialog = require('esui/Dialog');
    var u = require('underscore');

    var io = {};

    /**
     * 常规请求流程中的hook如下：
     *
     * io.request(url, data, options)
     *   │
     *   ├───── io.hooks.beforeRequest(data) ───┐
     *   │                                      │
     *   │<────────────── data ─────────────────┘
     *   │
     *   ├───── io.hooks.afterResponse(data) ───┐
     *   │                                      │
     *   │<────────────── data ─────────────────┘
     *   │
     *   └─────────────────┐
     *   ┌──── success ────♦──── failure ────┐
     *   │                                   │
     *   ├─ io.hooks.afterSuccess(data) ─┐   ├─ io.hooks.afterFailure(message) ─┐
     *   │                               │   │                                  │
     *   │<──────────── data ────────────┘   │<───────────── message ───────────┘
     *   │                                   │
     *   ├───────────────────────────────────┘
     *   ●
     */
    io.hooks = {};

    var CODE_MAP = {
        0: 'SUCCESS',
        1: 'GLOBAL',
        2: 'FIELD',
        3: 'REDIRECT',
        4: 'NO_SESSION'
    };

    var MINIMAL_CUSTOM_FAIL_CODE = 100;

    var SERVER_ERROR = getGlobalError('服务器错误');
    var PARSE_ERROR = getGlobalError('数据解析失败');
    var SCHEMA_ERROR = getGlobalError('数据格式错误');
    var UNKNOWN_ERROR = getGlobalError('未知错误');

    function getGlobalError(message) {
        return {
            success: false,
            message: {
                global: message
            }
        };
    }

    function prepareResponse(data) {
        if (typeof data.code !== 'undefined') { // 有code时认为是新版接口
            var status = CODE_MAP[data.code];

            if (!status) {
                if (data.code < MINIMAL_CUSTOM_FAIL_CODE) { // 非预定义类型，未知错误
                    return UNKNOWN_ERROR;
                }
                else { // 自定义类型错误
                    var message = data.message || {};
                    message.code = data.code;
                    return {
                        success: false,
                        message: message
                    };
                }
            }
            else {
                if (status === 'SUCCESS') {
                    return {
                        success: true,
                        message: data.message,
                        result: data.result || data.page
                    };
                }
                else {
                    return {
                        success: false,
                        message: data.message
                    };
                }
            }
        }
        else if (typeof data.success !== 'undefined') {
            return data;
        }
        else {
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

        if ((data.success + '') !== 'true') {
            var message = data.message;
            var title;
            var content;
            var onok;
            var needAlert = true;

            if (typeof message.global !== 'undefined') {
                title = '系统提示';
                content = message.global;
            }
            else if (typeof message.noSession !== 'undefined') {
                title = '系统超时';
                content = message.noSession;
                onok = gotoIndex;
            }
            else if (typeof message.redirect !== 'undefined') {
                if (message.redirect === '') {
                    title = '登录超时';
                    content = '登录超时，请重新登录！';
                    onok = function() {
                        window.location.reload(true);
                    };
                }
                else {
                    window.location.href = message.redirect;
                    return;
                }
            }
            else if (typeof message.field !== 'undefined' || typeof message.code !== 'undefined') {
                // 字段错误不需要弹窗提示，直接在表单中处理
                // 自定义错误也在后面的过程中自行处理
                needAlert = false;
            }
            else { // last resort
                title = '系统提示';
                content = '未知错误';
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
        }
        else { // 成功状态
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
        if (status < 200 || (status >= 300 && status !== 304)) { // 服务器没有正常返回
            error = SERVER_ERROR;
        }
        else {
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

    io.request = function(url, data, options) {
        var defaults = {
            url: url,
            data: data,
            dataType: 'json',
            charset: 'utf-8'
        };

        options = options
            ? u.defaults(options, defaults)
            : defaults;

        if (typeof io.hooks.beforeRequest === 'function') {
            options = io.hooks.beforeRequest(options) || options;
        }

        return ajax.request(options)
            .then(
                requestSuccessHandler,
                requestFailureHandler
            );
    };

    io.get = function(url, data, options) {
        u.extend(options, {
            method: 'GET'
        });
        return this.request(url, data, options);
    };

    io.post = function(url, data, options) {
        u.extend(options, {
            method: 'POST'
        });
        return this.request(url, data, options);
    };

    // return模块
    return io;
});
