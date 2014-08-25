/**
 * Ecom Framework
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file ActionPanel
 * @author otakustay
 */
define(
    function (require) {
        var events = require('er/events');
        var Panel = require('esui/Panel');

        /**
         * @class ef.ActionPanel
         *
         * 用于加载子Action的面板控件
         *
         * @extends esui.Panel
         * @constructor
         */
        var exports = {};

        exports.type = 'ActionPanel';

        /**
         * 设置HTML内容，`ActionPanel`没有这功能
         */
        exports.setContent = function () {
        };

        /**
         * 加载的Action的类型
         *
         * @type {string}
         */
        exports.actionType = null;

        /**
         * 加载的Action的实例
         *
         * @type {er.Action | er.meta.Promise}
         * @readonly
         */
        exports.action = null;

        /**
         * 代理子Action的事件
         *
         * @param {mini-event.Event} e 事件对象
         */
        function delegateActionEvent(e) {
            var event = require('mini-event').fromEvent(e, { preserveData: true, syncState: true });
            event.type = 'action@' + e.type;
            this.fire(event);
        }

        /**
         * 把已经加载的子Action赋值到控件上
         *
         * @param {mini-event.Event} e 事件对象
         */
        function attachAction(e) {
            if (!e.isChildAction || e.container !== this.main.id) {
                return;
            }

            this.action = e.action;

            // 代理所有的子Action的事件
            if (typeof this.action.on === 'function') {
                this.action.on('*', delegateActionEvent, this);
            }

            this.fire('actionattach');
        }

        /**
         * 通知子Action加载完毕
         *
         * @param {mini-event.Event} e 事件对象
         */
        function notifyActionLoadComplete(e) {
            if (!e.isChildAction || e.container !== this.main.id) {
                return;
            }

            this.fire('actionloaded');
        }

        /**
         * 通知子Action加载失败
         *
         * @param {mini-event.Event} e 事件对象
         * @param {string} e.reason 失败原因
         */
        function notifyActionLoadFailed(e) {
            if (!e.isChildAction || e.container !== this.main.id) {
                return;
            }

            this.action = null;
            this.fire(
                'actionloadfail',
                { failType: e.failType, reason: e.reason }
            );
        }

        /**
         * 通知子Action加载中断
         *
         * @param {mini-event.Event} e 事件对象
         * @param {string} e.reason 失败原因
         * @inner
         */
        function notifyActionLoadAborted(e) {
            if (!e.isChildAction || e.container !== this.main.id) {
                return;
            }

            this.fire('actionloadabort');
        }

        /**
         * 初始化结构
         *
         * @protected
         * @override
         */
        exports.initStructure = function () {
            events.on('enteraction', attachAction, this);
            events.on('enteractioncomplete', notifyActionLoadComplete, this);
            events.on('actionnotfound', notifyActionLoadFailed, this);
            events.on('permissiondenied', notifyActionLoadFailed, this);
            events.on('actionfail', notifyActionLoadFailed, this);
            events.on('enteractionfail', notifyActionLoadFailed, this);
            events.on('actionabort', notifyActionLoadAborted, this);
        };

        /**
         * 销毁控件上关联的Action
         */
        exports.disposeAction = function () {
            var Deferred = require('er/Deferred');
            var action = this.action;

            if (!action) {
                return;
            }

            // Action正在加载，正确的`renderChildAction`得到的加载器有`abort`方法
            if (Deferred.isPromise(action) && typeof action.abort === 'function') {
                action.abort();
            }
            // 已经加载完的Action，但并不一定会有`leave`或`un`方法
            else {
                if (typeof action.un === 'function') {
                    action.un('*', delegateActionEvent, this);
                }
                if (typeof action.leave === 'function') {
                    action.leave();
                }
            }

            this.action = null;
        };

        /**
         * 重构
         *
         * @override
         * @protected
         */
        exports.repaint = require('esui/painters').createRepaint(
            Panel.prototype.repaint,
            {
                name: ['url', 'actionOptions'],
                paint: function (panel, url, actionOptions) {
                    panel.disposeAction();

                    if (!url) {
                        return;
                    }

                    if (panel.lazy && panel.helper.isInStage('INITED')) {
                        return;
                    }

                    var controller = require('er/controller');
                    panel.action = controller.renderChildAction(
                        url,
                        panel.main.id,
                        actionOptions
                    );

                    // 如果发生错误，因为事件是同步触发的，
                    // 因此先执行`notifyActionLoadFailed`再赋值，导致没清掉。
                    // 错误时返回的`Promise`对象是没有`abort`方法的，
                    // 这种对象我们也不需要，因此直接清掉
                    if (typeof panel.action.abort !== 'function') {
                        panel.action = null;
                    }
                }
            }
        );

        /**
         * 销毁控件
         *
         * @override
         */
        exports.dispose = function () {
            this.disposeAction();

            // 移除注册的一堆方法
            events.un('enteraction', attachAction, this);
            events.un('enteractioncomplete', notifyActionLoadComplete, this);
            events.un('actionnotfound', notifyActionLoadFailed, this);
            events.un('permissiondenied', notifyActionLoadFailed, this);
            events.un('actionfail', notifyActionLoadFailed, this);
            events.un('enteractionfail', notifyActionLoadFailed, this);
            events.un('actionabort', notifyActionLoadAborted, this);

            this.$super(arguments);
        };

        /**
         * 重新加载管理的子Action
         *
         * @param {Object} [actionOptions] 子Action的额外数据
         */
        exports.reload = function (actionOptions) {
            var url = this.url;
            this.url = null;
            this.setProperties({ url: url, actionOptions: actionOptions });
        };

        var ActionPanel = require('eoo').create(Panel, exports);
        require('esui').register(ActionPanel);
        return ActionPanel;
    }
);
