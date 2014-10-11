define(
    function (require) {
        var u = require('underscore');
        var View = require('er/View');

        require('ef/ActionDialog');

        /**
         * @class ef.UIView
         *
         * 与ESUI结合的`View`基类
         *
         * @constructor
         * @extends er.View
         */
        var exports = {};

        function getProperty(target, path) {
            var value = target;
            for (var i = 0; i < path.length; i++) {
                value = value[path[i]];
            }

            return value;
        }

        /**
         * 替换元素属性中的特殊值
         *
         * @param {string} value 需要处理的值
         * @return {*} 处理完的值
         * @public
         */
        exports.replaceValue = function (value) {
            if (typeof value !== 'string') {
                return value;
            }

            if (value === '@@' || value === '**') {
                return this.model;
            }

            var prefix = value.charAt(0);
            var actualValue = value.substring(1);

            if (prefix === '@' || prefix === '*') {
                var path = actualValue.split('.');
                var value = this.model.get(path[0]);
                return path.length > 1
                    ? getProperty(value, path.slice(1))
                    : value;
            }
            else {
                return value;
            }
        };

        /**
         * 根据id获取当前视图下的控件
         *
         * @param {string} id 控件的id
         * @return {Control=} 对应的控件
         * @protected
         */
        exports.get = function (id) {
            return this.viewContext.get(id);
        };

        /**
         * 根据id获取控件实例，如无相关实例则返回`esui.SafeWrapper`
         *
         * @param {string} id 控件id
         * @return {Control} 根据id获取的控件
         */
        exports.getSafely = function (id) {
            return this.viewContext.getSafely(id);
        };

        /**
         * 根据name获取当前视图下的控件组
         *
         * @param {string} name 控件组的名称
         * @return {ControlGroup} 对应的控件组
         * @protected
         */
        exports.getGroup = function (name) {
            return this.viewContext.getGroup(name);
        };

        /**
         * 创建一个控件实例
         *
         * @param {string} type 控件的类型
         * @param {Obejct=} options 创建控件时的选项
         * @return {Control}
         * @proceted
         */
        exports.create = function (type, options) {
            options = options || {};
            if (!options.viewContext) {
                options.viewContext = this.viewContext;
            }
            return require('esui').create(type, options);
        };

        /**
         * 显示一条提示信息
         *
         * @param {string | Object} content 提示的内容或完整的配置项
         * @param {string=} title 提示框的标题，如`content`提供配置项则无此参数
         * @return {esui/Dialog}
         * @protected
         */
        exports.alert = function (content, title) {
            var options = typeof content === 'string'
                ? { title: title || document.title, content: content }
                : u.clone(content);
            if (!options.viewContext) {
                options.viewContext = this.viewContext;
            }

            var Dialog = require('esui/Dialog');
            return Dialog.alert(options);
        };

        /**
         * 显示一条确认信息
         *
         * @param {string | Object} content 提示的内容或完整的配置项
         * @param {string=} title 提示框的标题，如`content`提供配置项则无此参数
         * @return {esui/Dialog}
         * @protected
         */
        exports.confirm = function (content, title) {
            var options = typeof content === 'string'
                ? { title: title || document.title, content: content }
                : u.clone(content);
            if (!options.viewContext) {
                options.viewContext = this.viewContext;
            }

            var Dialog = require('esui/Dialog');
            return Dialog.confirm(options);
        };

        /**
         * 显示ActionDialog
         *
         * @param {Object} options 参数
         * @return {esui/Dialog}
         * @protected
         */
        exports.popActionDialog = function (options) {
            //创建main
            var main = document.createElement('div');
            document.body.appendChild(main);

            var defaults = {
                width: 600,
                needFoot: false,
                draggable: true,
                closeOnHide: true,
                autoClose: true,
                main: main,
                viewContext: this.viewContext
            };
            options = u.defaults({}, options, defaults);

            var ui = require('esui/main');
            var dialog = ui.create('ActionDialog', options);

            dialog.render();
            dialog.show();
            return dialog;
        };

        /*
         * 声明控件的事件。该属性有2种方式：
         *
         * - 以`id:eventName`为键，以处理函数为值。
         * - 以`id`为键，值为一个对象，对象中以`eventName`为键，处理函数为值。
         *
         * 在此处声明的事件，运行时的`this`对象均是`View`实例，而非控件的实例。
         *
         * 同时，在运行期，`UIView`会克隆该属性，将其中所有的处理函数都进行一次`bind`，
         * 将`this`指向自身，因此运行时的`uiEvents`与类声明时的不会相同。
         *
         * 如果需要解除某个事件的绑定，可以使用`.on('type', this.uiEvents.xxx)`进行。
         *
         * @type {Object}
         * @public
         */
        exports.uiEvents = null;

        /*
         * 获取当前视图关联的控件事件声明。参考`uiEvents`属性
         *
         * @return {Object}
         * @public
         */
        exports.getUIEvents = function () {
            return this.uiEvents || {};
        };

        /**
         * 声明控件的额外属性。
         *
         * 这个属性以控件的id为键，以一个对象为值。对象表示要额外附加到控件上的属性。
         * 当控件实例化时，会把DOM中声明的属性与此处声明的合并在一起，此处声明的为优先。
         *
         * @type {Object}
         * @public
         */
        exports.uiProperties = null;

        /**
         * 声明当前视图关联的控件的额外属性，参考`uiProperties`属性
         *
         * @return {Object}
         */
        exports.getUIProperties = function () {
            return this.uiProperties;
        };

        /**
         * 给指定的控件绑定事件
         *
         * @param {UIView} view View对象实例
         * @param {string} id 控件的id
         * @param {string} eventName 事件名称
         * @param {function | string} handler 事件处理函数，或者对应的方法名
         * @return {function} 绑定到控件上的事件处理函数，不等于`handler`参数
         * @inner
         */
        function bindEventToControl(view, id, eventName, handler) {
            if (typeof handler === 'string') {
                handler = view[handler];
            }

            // TODO: mini-event后续会支持`false`作为处理函数，要考虑下
            if (typeof handler !== 'function') {
                return handler;
            }

            var control = view.get(id);
            if (control) {
                control.on(eventName, handler, view);
            }

            return handler;
        }

        /**
         * 绑定控件的事件。
         *
         * @override
         * @protected
         */
        exports.bindEvents = function () {
            var events = this.getUIEvents();
            if (!events) {
                return;
            }

            for (var key in events) {
                if (!events.hasOwnProperty(key)) {
                    // 下面逻辑太长了，在这里先中断
                    continue;
                }

                // 可以用`submit:click`的形式在指定控件上绑定指定类型的控件
                var segments = key.split(':');
                if (segments.length > 1) {
                    var id = segments[0];
                    var type = segments[1];
                    var handler = events[key];
                    bindEventToControl(this, id, type, handler);
                }
                // 也可以是一个控件的id，值是对象，里面每一项都是一个事件类型
                else {
                    var map = events[key];

                    if (typeof map !== 'object') {
                        return;
                    }

                    for (var type in map) {
                        if (map.hasOwnProperty(type)) {
                            var handler = map[type];
                            bindEventToControl(this, key, type, handler);
                        }
                    }
                }
            }
        };

        var counter = 0x861005;
        function getGUID() {
            return 'ef-' + counter++;
        }

        /**
         * 获取当前视图的名称，通常用于生成`ViewContext`
         *
         * @return {string}
         * @protected
         */
        exports.getViewName = function () {
            if (this.name) {
                return this.name;
            }

            // 从构造函数把名字猜出来
            var name = this.constructor && this.constructor.name;
            if (!name && this.constructor) {
                // 用正则猜名字
                var functionString = this.constructor.toString();
                var match = /function\s+([^\(]*)/.exec(functionString);
                // 去除函数名后面的空格
                name = match && match[1].replace(/\s+$/g, '');
            }
            // 再不行用计数
            if (!name) {
                name = getGUID();
            }

            // 以下代码是一个洁癖和强近症患者所写：

            // 如果名字是XxxView，把最后的View字样去掉
            name = name.replace(/View$/, '');
            // 从PascalCase转为横线分隔，这里需要注意，连续的大写字母不应该连续分隔
            name = name.replace(
                /[A-Z]{2,}/g,
                function (match) {
                    // 这里把ABCD这种连续的大写，转成AbcD这种形式。
                    // 如果`encodeURIComponent`，会变成`encodeUriComponent`，
                    // 然后加横线后就是`encode-uri-component`得到正确的结果
                    return match.charAt(0)
                        + match.slice(1, -1).toLowerCase()
                        + match.charAt(match.length - 1);
                }
            );
            name = name.replace(
                /[A-Z]/g,
                function (match) { return '-' + match.toLowerCase(); }
            );
            if (name.charAt(0) === '-') {
                name = name.substring(1);
            }

            return name;
        };

        /**
         * 创建当前`UIView`使用的`ViewContext`对象
         *
         * @return {ViewContext}
         * @public
         */
        exports.createViewContext = function () {
            var ViewContext = require('esui/ViewContext');
            var name = this.getViewName();

            return new ViewContext(name || null);
        };

        /**
         * 当容器渲染完毕后触发，用于控制元素可见性及绑定事件等DOM操作
         *
         * @override
         * @protected
         */
        exports.enterDocument = function () {
            this.viewContext = this.createViewContext();

            var container = this.getContainerElement();
            var options = {
                viewContext: this.viewContext,
                properties: this.getUIProperties(),
                valueReplacer: u.bind(this.replaceValue, this)
            };
            try {
                require('esui').init(container, options);
            }
            catch (ex) {
                var error = new Error(
                    'ESUI initialization error on view '
                    + 'because: ' + ex.message
                );
                error.actualError = ex;
                throw error;
            }


            this.bindEvents();
        };

        /**
         * 销毁当前视图
         *
         * @override
         * @protected
         */
        exports.dispose = function () {
            if (this.viewContext) {
                this.viewContext.dispose();
                this.viewContext = null;
            }
            this.$super(arguments);
        };

        var UIView = require('eoo').create(View, exports);
        return UIView;
    }
);
