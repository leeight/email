/**
 * @file 各种钩子扩展
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var u = require('underscore');
    var URI = require('urijs');
    var loading = require('../ui/loading');

    function getAderArgMap() {
        var user = require('../system/user');
        var aderId = user.ader && user.ader.id
            || URI.parseQuery(document.location.search).aderId
            || user.visitor && user.visitor.id;
        return aderId ? { aderId: aderId } : {};
    }

    /**
     * 激活扩展
     *
     * @param {Object} hooks 需要启用的钩子扩展，默认为都启用，键名为钩子名称，键值为falsy值时禁用
     *
     * 可用的钩子名称如下：
     * * SHOW_LOADING
     * * ADD_ADER_ID
     * * ADD_ER_REQUEST_HEADER
     */
    function activate(hooks) {

        // 设定默认值
        hooks = u.defaults(hooks || {}, {
            SHOW_LOADING: true,
            ADD_ADER_ID: true,
            ADD_ER_REQUEST_HEADER: true
        });

        var io = require('../io/serverIO');

        if (hooks.ADD_ADER_ID) {
            io.hooks.filterIndexUrl = function(url) {
                return URI(url).addQuery(getAderArgMap()).toString();
            };

            var Uploader = require('bat-ria/ui/Uploader');
            Uploader.prototype.filterAction = function (action) {
                var argMap = getAderArgMap();
                if (argMap) {
                    action = URI(action).addQuery(argMap).toString();
                }
                return action;
            };
        }

        io.hooks.beforeRequest = function(options) {
            if (hooks.ADD_ADER_ID) {
                var url = options.url;
                var argMap = getAderArgMap();
                if (argMap) {
                    options.url = URI(url).addQuery(argMap).toString();
                }
            }

            if (options.showLoading !== false && hooks.SHOW_LOADING) {
                loading.show();
            }

            return options;
        };

        if (hooks.SHOW_LOADING) {
            io.hooks.afterComplete = function() {
                loading.hide();
            };
        }

        if (hooks.ADD_ER_REQUEST_HEADER) {
            var ajax = require('er/ajax');
            ajax.hooks.beforeSend = function(xhr) {
                xhr.setRequestHeader('X-Request-By', 'ERApplication');
            };
        }
    }

    return {
        activate: u.once(activate)
    };
});
