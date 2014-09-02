define('er-track/main', [
    'require',
    './events'
], function (require) {
    var exports = {};
    var globalConfig = { packageName: 'er-track' };
    exports.config = function (name, value) {
        globalConfig[name] = value;
        return this;
    };
    exports.create = function () {
        var config = {};
        function getConfig(name) {
            return config[name] || globalConfig[name] || null;
        }
        var trackers = {};
        function each(method, args) {
            for (var name in trackers) {
                if (trackers.hasOwnProperty(name)) {
                    var tracker = trackers[name];
                    tracker[method] && tracker[method].apply(tracker, args);
                }
            }
        }
        var instance = {};
        instance.config = function (name, value) {
            config[name] = value;
            return this;
        };
        instance.use = function (name) {
            if (trackers[name]) {
                return trackers[name];
            }
            var proxy = {
                    name: name,
                    configuration: {},
                    config: function (name, value) {
                        this.configuration[name] = value;
                        return this;
                    },
                    setAccount: function (account) {
                        return this.config('account', account);
                    }
                };
            trackers[name] = proxy;
            return proxy;
        };
        var pendingCommands = [];
        function flushPendingCommands() {
            for (var i = 0; i < pendingCommands.length; i++) {
                var method = pendingCommands[i][0];
                var args = pendingCommands[i][1];
                each(method, args);
            }
        }
        instance.start = function () {
            var dependencies = [];
            for (var name in trackers) {
                if (trackers.hasOwnProperty(name)) {
                    var moduleName = getConfig('packageName') + '/trackers/' + name;
                    dependencies.push(moduleName);
                }
            }
            window.require(dependencies, function () {
                var pendingUnits = arguments.length;
                function forward() {
                    pendingUnits--;
                    if (pendingUnits === 0) {
                        flushPendingCommands();
                        pendingCommands = {
                            push: function (command) {
                                each(command[0], command[1]);
                            }
                        };
                    }
                }
                for (var i = 0; i < arguments.length; i++) {
                    var factory = arguments[i];
                    var config = trackers[factory.name].configuration;
                    var tracker = factory.create(config);
                    trackers[factory.name] = tracker;
                    tracker.load(forward);
                }
            });
        };
        var events = require('./events');
        function pushCommand() {
            pendingCommands.push.apply(pendingCommands, arguments);
        }
        instance.include = function (name) {
            if (events.hasOwnProperty(name)) {
                events[name](pushCommand);
            }
            return this;
        };
        instance.includeAll = function () {
            for (var name in events) {
                instance.include(name);
            }
            return this;
        };
        return instance;
    };
    return exports;
});

define('er-track', ['er-track/main'], function ( main ) { return main; });