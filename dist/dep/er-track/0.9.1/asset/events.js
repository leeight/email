define('er-track/events', [
    'require',
    'er/events',
    'er/Deferred',
    'er/ajax'
], function (require) {
    return {
        pageView: function (track) {
            require('er/events').on('redirect', function (e) {
                track([
                    'trackPageView',
                    [e]
                ]);
            });
        },
        exception: function (track) {
            require('er/Deferred').on('exception', function (e) {
                track([
                    'trackException',
                    [e]
                ]);
            });
        },
        requestTimeout: function (track) {
            require('er/ajax').on('timeout', function (e) {
                var args = [
                        e.options.url,
                        e.options
                    ];
                track([
                    'trackRequestTimeout',
                    args
                ]);
            });
        },
        enterAction: function (track) {
            require('er/events').on('enteractioncomplete', function (e) {
                track([
                    'trackEnterAction',
                    [e]
                ]);
            });
        },
        leaveAction: function (track) {
            require('er/events').on('leaveaction', function (e) {
                track([
                    'trackLeaveAction',
                    [e]
                ]);
            });
        }
    };
});