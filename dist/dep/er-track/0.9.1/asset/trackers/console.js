define('er-track/trackers/console', ['require'], function (require) {
    function logLine(entries) {
        if (!window.console) {
            return;
        }
        if (typeof console.log === 'function') {
            console.log.apply(console, entries);
        } else {
            console.log(entries.join(' '));
        }
    }
    function logWithGroup(groupName) {
        if (!window.console) {
            return;
        }
        if (console.groupCollapsed) {
            console.groupCollapsed(groupName);
            for (var i = 1; i < arguments.length; i++) {
                logLine(arguments[i]);
            }
            console.groupEnd(groupName);
        } else {
            console.log('\u27A4' + groupName);
            var prefix = '\u251C\u2500\u2500\u2500';
            for (var i = 1; i < arguments.length; i++) {
                if (i === arguments.length - 1) {
                    prefix = '\u2514\u2500\u2500\u2500';
                }
                var entry = arguments[i];
                if (typeof entry === 'string') {
                    entry = prefix + entry;
                } else {
                    entry[0] = prefix + entry[0];
                }
                logLine(entry);
            }
        }
    }
    var exports = { name: 'console' };
    exports.create = function (config) {
        return {
            name: 'console',
            trackException: function (context) {
                var entries = [
                        '\u6211\u9760\uFF0C\u6709\u4E2APromise\u51FA\u5F02\u5E38\u4E86',
                        [
                            '\u51FA\u4E8B\u7684Deferred\u5BF9\u8C61: ',
                            context.deferred
                        ],
                        [
                            '\u51FA\u4E8B\u65F6\u7ED9\u7684\u53C2\u6570: ',
                            context.args
                        ],
                        ['\u51FA\u4E8B\u7684\u539F\u56E0\u5927\u6982\u662F: ' + context.reason]
                    ];
                if (context.reason instanceof Error) {
                    entries.push('\u597D\u50CF\u662F\u4E00\u4E2A\u5F02\u5E38\u5BF9\u8C61\uFF0C\u6240\u4EE5\u628A\u8C03\u7528\u5806\u6808\u7ED9\u4F60\u770B\u770B\u597D\u4E86\uFF1A\n' + context.reason.stack);
                }
                logWithGroup.apply(null, entries);
            },
            trackEnterAction: function (context) {
                logWithGroup('\u4EB2\u4F60\u6B63\u5728\u8FDB\u5165"' + context.url + '"', [
                    'Action\uFF1A',
                    context.action
                ], [
                    'Model\uFF1A',
                    context.action.model
                ], [
                    'Model\u91CC\u7684\u6570\u636E\uFF1A',
                    context.action.model.dump()
                ], [
                    'View\uFF1A',
                    context.action.view
                ], [
                    'DOM\u5BB9\u5668\uFF1A',
                    context.action.view.getContainerElement()
                ]);
            },
            trackLeaveAction: function (context) {
                logWithGroup('\u4EB2\u4F60\u5DF2\u7ECF\u79BB\u5F00"' + context.action.context.url + '"', [
                    '\u5F53\u524D\u7684Action\uFF1A',
                    context.action
                ], ['\u524D\u5F80\u7684URL\uFF1A' + context.to.url]);
            },
            load: function (callback) {
                callback();
            }
        };
    };
    return exports;
});