/**
 * Ecom Framework
 * Copyright 2013 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file ChildView
 * @author otakustay
 */
define(
    function (require) {
        var u = require('underscore');
        var Control = require('esui/Control');

        /**
         * @class ef.ChildView
         *
         * 子视图控件，用于加载一个{@link er.View}
         *
         * @constructor
         * @extends esui.Control
         */
        var exports = {};

        /**
         * 控件的类型，始终为`"ChildView"`
         *
         * @type {string}
         * @readonly
         * @override
         */
        exports.type = 'ChildView';

        /**
         * 重绘
         *
         * @protected
         * @override
         */
        exports.repaint = require('esui/painters').createRepaint(
            Control.prototype.repaint,
            {
                name: 'viewType',
                paint: function (childView, viewType) {
                    childView.disposeView();

                    var Deferred = require('er/Deferred');
                    childView.view = Deferred.require([viewType]);
                    childView.view.then(u.bind(childView.fire, childView, 'viewloaded'));
                    childView.view.then(u.bind(childView.renderView, childView));
                }
            }
        );

        /**
         * 销毁对应的视图
         *
         * 如果在视图模块加载过程中，调用了此方法是没有效果的，加载完后会继续把视图渲染出来
         */
        exports.disposeView = function () {
            var view = this.get('view');

            if (view && typeof view.dispose === 'function') {
                view.dispose();
            }

            this.view = null;
        };

        /**
         * 代理View的事件
         *
         * @param {mini-event.Event} e 事件对象
         */
        function delegateViewEvents(e) {
            var event = require('mini-event').fromEvent(e, { preserveData: true, syncState: true });
            event.type = 'view@' + e.type;
            this.fire(event);
        }

        /**
         * 渲染加载完毕的视图对象
         *
         * @param {Mixed} View 加载完毕的视图构造函数或对象
         * @protected
         */
        exports.renderView = function (View) {
            // 仅当渲染完成阶段才会对View进行操作，销毁的时候这里不处理
            if (this.helper.isInStage('RENDERED')) {
                this.loadedViewModule = View; // 存下来，后面还会用到的
                var view = this.view = typeof View === 'function' ? new View() : View;
                view.model = this.get('model');
                view.container = this.main.id;
                view.render();

                this.fire('viewrendered');

                view.on('*', delegateViewEvents, this);
            }
        };

        /**
         * 刷新包含的视图
         */
        exports.refresh = function () {
            var viewModule = this.get('loadedViewModule');
            if (!viewModule) {
                throw new Error('No view module loaded yet');
            }
            this.disposeView();
            this.renderView(viewModule);
        };

        var ChildView = require('eoo').create(Control, exports);
        require('esui').register(ChildView);
        return ChildView;
    }
);
