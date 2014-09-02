define('er-track/trackers/baidu', [
    'require',
    '../loadScript'
], function (require) {
    if (!window._hmt) {
        window._hmt = [];
    }
    var exports = { name: 'baidu' };
    exports.create = function (config) {
        return {
            name: 'baidu',
            trackPageView: function (context) {
                var referrer = context.referrer || document.referrer;
                window._hmt.push([
                    '_setReferrerOverride',
                    referrer
                ]);
                window._hmt.push([
                    '_trackPageview',
                    context.url
                ]);
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
});