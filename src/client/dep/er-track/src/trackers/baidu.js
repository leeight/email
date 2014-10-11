/**
 * ER-Track
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 百度统计追踪器
 * @author otakustay
 */
define(
    function (require) {
        // 初始化百度统计用全局数组
        if (!window._hmt) {
            window._hmt = [];
        }

        var exports = { name: 'baidu' };

        exports.create = function (config) {
            return {
                name: 'baidu',

                trackPageView: function (context) {
                    var referrer = context.referrer || document.referrer;
                    window._hmt.push(['_setReferrerOverride', referrer]);
                    window._hmt.push(['_trackPageview', context.url]);

                    return this;
                },

                load: function (callback) {
                    if (!config.account) {
                        return callback();
                    }

                    var url = config.scriptURL || '//hm.baidu.com/hm.js';
                    url += '?' + config.account;

                    var loadScript = require('../loadScript');
                    loadScript(url, callback);
                }
            };
        };

        return exports;
    }
);
