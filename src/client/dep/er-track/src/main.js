/**
 * ER-Track
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 主入口
 * @author otakustay
 */
define(
    function (require) {
        var exports = {};

        var globalConfig = {
            packageName: 'er-track'
        };

        /**
         * 设置配置
         *
         * @param {string} name 配置项名称
         * @param {Mixed} value 配置项值
         */
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

            /**
             * 设置配置
             *
             * @param {string} name 配置项名称
             * @param {Mixed} value 配置项值
             */
            instance.config = function (name, value) {
                config[name] = value;
                return this;
            };

            /**
             * 启用指定追踪器
             *
             * @param {string} name 追踪器名称
             * @return {Object}
             */
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

            /**
             * 启用追踪
             */
            instance.start = function () {
                var dependencies = [];
                for (var name in trackers) {
                    if (trackers.hasOwnProperty(name)) {
                        var moduleName = 
                            getConfig('packageName') + '/trackers/' + name;
                        dependencies.push(moduleName);
                    }
                }

                window.require(
                    dependencies,
                    function () {
                        var pendingUnits = arguments.length;

                        function forward() {
                            pendingUnits--;
                            if (pendingUnits === 0) {
                                // 刷掉未执行的命令
                                flushPendingCommands();

                                // 之后所有的命令全部直接执行
                                pendingCommands = {
                                    push: function (command) {
                                        each(command[0], command[1]);
                                    }
                                };
                            }
                        }

                        for (var i = 0; i < arguments.length; i++) {
                            // 用加载过来的追踪器替换现在的`proxy`
                            var factory = arguments[i];
                            var config = trackers[factory.name].configuration;
                            var tracker = factory.create(config);
                            trackers[factory.name] = tracker;
                            // 让所有的追踪器能load一下，经典N -> 1的并发模型
                            tracker.load(forward);
                        }
                    }
                );

            };

            var events = require('./events');

            function pushCommand() {
                pendingCommands.push.apply(pendingCommands, arguments);
            }

            /**
             * 加入指定事件的跟踪
             *
             * @param {string} name 事件名称
             */
            instance.include = function (name) {
                if (events.hasOwnProperty(name)) {
                    events[name](pushCommand);
                }
                return this;
            };

            /**
             * 跟踪所有事件
             */
            instance.includeAll = function () {
                for (var name in events) {
                    instance.include(name);
                }
                return this;
            };

            return instance;
        };

        return exports;
    }
);
