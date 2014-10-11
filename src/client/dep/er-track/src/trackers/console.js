/**
 * ER-Track
 * Copyright 2013 Baidu Inc. All rights reserved.
 * 
 * @file 百度统计追踪器
 * @author otakustay
 */
define(
    function (require) {
        function logLine(entries) {
            if (!window.console) {
                return;
            }

            // IE的`console.log`不是函数，不支持`apply`，且不支持多个参数
            if (typeof console.log === 'function') {
                console.log.apply(console, entries);
            }
            else {
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
            }
            else {
                console.log('➤' + groupName);
                var prefix = '├───';
                for (var i = 1; i < arguments.length; i++) {
                    if (i === arguments.length - 1) {
                        prefix = '└───';
                    }
                    var entry = arguments[i];
                    if (typeof entry === 'string') {
                        entry = prefix + entry;
                    }
                    else {
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
                        '我靠，有个Promise出异常了',
                        ['出事的Deferred对象: ', context.deferred],
                        ['出事时给的参数: ', context.args],
                        ['出事的原因大概是: ' + context.reason]
                    ];
                    if (context.reason instanceof Error) {
                        entries.push(
                            '好像是一个异常对象，所以把调用堆栈给你看看好了：\n'
                                + context.reason.stack
                        );
                    }
                    logWithGroup.apply(null, entries);
                },

                trackEnterAction: function (context) {
                    logWithGroup(
                        '亲你正在进入"' + context.url + '"',
                        ['Action：', context.action],
                        ['Model：', context.action.model],
                        ['Model里的数据：', context.action.model.dump()],
                        ['View：', context.action.view],
                        ['DOM容器：', context.action.view.getContainerElement()]
                    );
                },

                trackLeaveAction: function (context) {
                    logWithGroup(
                        '亲你已经离开"' + context.action.context.url + '"',
                        ['当前的Action：', context.action],
                        ['前往的URL：' + context.to.url]
                    );
                },

                load: function (callback) {
                    callback();
                }
            };
        };

        return exports;
    }
);
