/**
 * @file 业务`View`基类
 * @author Justineo(justice360@gmail.com)
 */

define(function (require) {
    var util = require('er/util');
    var u = require('underscore');
    var UIView = require('ef/UIView');
    var Deferred = require('er/Deferred');
    var Dialog = require('esui/Dialog');

    /**
     * 业务`View`基类
     *
     * @extends ef.UIView
     * @constructor
     */
    function BaseView() {
        UIView.apply(this, arguments);
    }

    util.inherits(BaseView, UIView);

    /**
     * 获取对应模板名称
     *
     * 当一个视图被作为子Action使用时，需要在其视图模板名后加上`_child`以进行区分，
     * 根据此设计，可以将视图切分为“完整页面”和“仅用于嵌套”两部分，根据约定命名
     *
     * @return {string}
     * @override
     */
    BaseView.prototype.getTemplateName = function () {
        var templateName =
            UIView.prototype.getTemplateName.apply(this, arguments);

        // 作为子Action嵌入页面时，模板使用`xxxMain`这个target
        if (this.model && this.model.get('isChildAction')) {
            templateName += '_child';
        }

        return templateName;
    };

    var globalToast;

    /**
     * 显示toast提示信息，这个方法会控制一个单例，以免信息叠在一起
     *
     * @param {string} content 显示的内容
     * @param {Object=} options 配置
     * @return {esui.Toast}
     */
    BaseView.prototype.showToast = function (content, options) {
        if (!content) {
            return;
        }

        if (!globalToast) {
            // 此处直接new控件出来，
            // 因为这个控件不能属于任何一个业务模块的ViewContext，
            // 不然会随着跳转被销毁，造成下次用不了
            var Toast = require('esui/Toast');
            var toastOptions = { disposeOnHide: false, autoShow: false };
            globalToast = new Toast(toastOptions);
            globalToast.render();
        }

        var properties = {
            content: content
        };
        properties = u.extend(properties, options);
        globalToast.setProperties(properties);
        globalToast.show();
        return globalToast;
    };

    /**
     * 显示Dialog
     *
     * @param {Object} options 参数
     * @return {esui/Dialog}
     * @protected
     */
    BaseView.prototype.popDialog = function (options) {
        // 创建main
        var main = document.createElement('div');
        document.body.appendChild(main);

        var defaults = {
            width: 600,
            needFoot: true,
            draggable: true,
            closeOnHide: false,
            autoClose: true,
            main: main,
            viewContext: this.viewContext
        };
        options = u.defaults({}, options, defaults);

        var ui = require('esui');
        var dialog = ui.create('Dialog', options);
        dialog.render();

        // 使用默认foot时，改变显示文字
        if (options.needFoot) {
            var okBtn = dialog.getFoot().getChild('btnOk');
            var cancelBtn = dialog.getFoot().getChild('btnCancel');
            var okText = u.escape(options.okText || '');
            var cancelText = u.escape(options.cancelText || '');
            okBtn.setContent(okText || Dialog.OK_TEXT);
            cancelBtn.setContent(cancelText || Dialog.CANCEL_TEXT);
        }

        dialog.show();
        return dialog;
    };

    /**
     * 等待一个`Dialog`触发`ok`或`cancel`事件，触发后一定会自动关闭
     *
     * @param {esui.Dialog=} dialog 指定的对话框控件，未指定则通过`popDialog`创建新对话框
     * @param {Object} options 参数
     * @return {er.Promise} 一个`Promise`对象，
     * 默认为点击确定按钮时进入`resolved`状态，
     * 点击取消按钮则进入`rejected`状态
     *
     * 有两种重载：
     * 1. waitDialog(options)
     * 2. waitDialog(dialog, options)
     */
    BaseView.prototype.waitDialog = function (dialog, options) {
        if (!(dialog instanceof Dialog)) {
            options = dialog;
            dialog = this.popDialog.call(this, options);
        }
        else if (!dialog.isShow) {
            dialog.show();
        }

        function btnClickHandler(dialog, type, args) {
            // 如果在参数里设置了处理函数，会在fire时执行
            dialog.fire(type);
            dialog.hide();
        }

        // 使用默认foot时，改变显示文字
        if (options.needFoot || dialog.getFoot()) {
            var okBtn = dialog.getFoot().getChild('btnOk');
            var cancelBtn = dialog.getFoot().getChild('btnCancel');
            var okText = u.escape(options.okText || '');
            var cancelText = u.escape(options.cancelText || '');
            okBtn.setContent(okText || Dialog.OK_TEXT);
            cancelBtn.setContent(cancelText || Dialog.CANCEL_TEXT);

            okBtn.un('click');
            cancelBtn.un('click');
            okBtn.on('click', u.partial(btnClickHandler, dialog, 'ok'));
            cancelBtn.on('click', u.partial(btnClickHandler, dialog, 'cancel'));
        }

        var deferred = new Deferred();

        dialog.un('ok');
        dialog.un('cancel');
        dialog.on('ok', deferred.resolver.resolve);
        dialog.on('cancel', deferred.resolver.reject);

        return deferred.promise;
    };

    /**
     * 显示一个`Dialog`，并指定触发`ok`与`cancel`事件（默认状态下为点击确定、取消按钮后触发）
     * 后的处理函数，可以手动指定阻止自动关闭
     *
     * @param {esui.Dialog=} dialog 指定的对话框控件，未指定则通过`popDialog`创建新对话框
     * @param {Object} options 参数
     * @param {function=} options.onOk `ok`事件处理函数，`this`指向对应的`Dialog`对象
     * @param {function=} options.onCancel `cancel`事件处理函数，`this`指向对应的`Dialog`对象
     * @return {esui.Dialog} 显示的`Dialog`对象
     *
     * `onOk`或`onCancel`的返回值如果为`false`，则不执行默认的关闭动作；
     * 如果返回值是一个`Event`对象，则在调用过`preventDefault()`后不执行默认动作；
     * 如果返回一个`Promise`对象，则在`resolve`时执行默认关闭动作，在`reject`时不执行
     *
     * 有两种重载：
     * 1. showDialog(options)
     * 2. showDialog(dialog, options)
     */
    BaseView.prototype.showDialog = function (dialog, options) {
        if (!(dialog instanceof Dialog)) {
            options = dialog;
            dialog = this.popDialog.call(this, options);
        }
        else if (!dialog.isShow) {
            dialog.show();
        }

        function btnClickHandler(dialog, type, args) {
            // 如果在参数里设置了处理函数，会在fire时执行
            dialog.fire(type);
        }

        options = options || {};

        // 使用默认foot时，改变显示文字
        if (options.needFoot || dialog.getFoot()) {
            var okBtn = dialog.getFoot().getChild('btnOk');
            var cancelBtn = dialog.getFoot().getChild('btnCancel');
            var okText = u.escape(options.okText || '');
            var cancelText = u.escape(options.cancelText || '');
            okBtn.setContent(okText || Dialog.OK_TEXT);
            cancelBtn.setContent(cancelText || Dialog.CANCEL_TEXT);

            okBtn.un('click');
            cancelBtn.un('click');
            okBtn.on('click', u.partial(btnClickHandler, dialog, 'ok'));
            cancelBtn.on('click', u.partial(btnClickHandler, dialog, 'cancel'));
        }

        function checkHide(useDefault) {
            // 返回值为false或被阻止默认行为的event，则不隐藏
            if (useDefault === false
                || useDefault instanceof require('mini-event/Event')
                && useDefault.isDefaultPrevented()) {
                return;
            }
            dialog && dialog.hide();
        }

        var blank = function () {};

        var onOk = u.bind(options.onOk || blank, dialog);
        var onCancel = u.bind(options.onCancel || blank, dialog);

        dialog.un('ok');
        dialog.un('cancel');
        dialog.on('ok', function () {
            Deferred.when(onOk()).then(checkHide, u.partial(checkHide, false));
        });
        dialog.on('cancel', function () {
            Deferred.when(onCancel()).then(checkHide, u.partial(checkHide, false));
        });

        return dialog;
    };

    /**
     * 等待用户确认提示
     *
     * 参数同`ef.UIView.prototype.alert`，但返回一个`Promise`对象
     *
     * @return {er.Promise} 一个`Promise`对象，用户确认则进入`resolved`状态
     */
    BaseView.prototype.waitAlert = function () {
        var dialog = this.alert.apply(this, arguments);
        var deferred = new Deferred();

        dialog.on('ok', deferred.resolver.resolve);

        return deferred.promise;
    };

    /**
     * 等待用户确认
     *
     * 参数同`ef.UIView.prototype.confirm`，但返回一个`Promise`对象
     *
     * @return {er.Promise} 一个`Promise`对象，用户确认则进入`resolved`状态，
     * 用户取消则进入`rejected`状态
     */
    BaseView.prototype.waitConfirm = function () {
        var dialog = this.confirm.apply(this, arguments);
        var deferred = new Deferred();

        dialog.on('ok', deferred.resolver.resolve);
        dialog.on('cancel', deferred.resolver.reject);

        return deferred.promise;
    };

    /**
     * 等待一个`DialogAction`加载完成
     *
     * @return {er.Promise} 一个`Promise`对象，
     * 对应的Action加载完成时进入`resolved`状态，
     * 如Action加载失败则进入`rejected`状态
     */
    BaseView.prototype.waitActionDialog = function () {
        var dialog = this.popActionDialog.apply(this, arguments);

        var deferred = new Deferred();

        dialog.on('actionloaded', deferred.resolver.resolve);
        dialog.on('actionloadfail', deferred.resolver.reject);
        dialog.on('actionloadabort', deferred.resolver.reject);

        return deferred.promise;
    };

    /**
     * 刷新权限设置，在Action加载过新内容时使用
     */
    BaseView.prototype.refreshAuth = function () {
        var authPanel = this.get('authPanel');
        if (authPanel) {
            authPanel.initAuth();
        }
    };

    return BaseView;
});
