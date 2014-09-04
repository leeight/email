define('bat-ria/mvc/BaseView', [
    'require',
    'er/util',
    'underscore',
    'ef/UIView',
    'er/Deferred',
    'esui/Dialog',
    'esui/Toast',
    'esui',
    'mini-event/Event'
], function (require) {
    var util = require('er/util');
    var u = require('underscore');
    var UIView = require('ef/UIView');
    var Deferred = require('er/Deferred');
    var Dialog = require('esui/Dialog');
    function BaseView() {
        UIView.apply(this, arguments);
    }
    util.inherits(BaseView, UIView);
    BaseView.prototype.getTemplateName = function () {
        var templateName = UIView.prototype.getTemplateName.apply(this, arguments);
        if (this.model && this.model.get('isChildAction')) {
            templateName += '_child';
        }
        return templateName;
    };
    var globalToast;
    BaseView.prototype.showToast = function (content, options) {
        if (!content) {
            return;
        }
        if (!globalToast) {
            var Toast = require('esui/Toast');
            var toastOptions = {
                    disposeOnHide: false,
                    autoShow: false
                };
            globalToast = new Toast(toastOptions);
            globalToast.render();
        }
        var properties = { content: content };
        properties = u.extend(properties, options);
        globalToast.setProperties(properties);
        globalToast.show();
        return globalToast;
    };
    BaseView.prototype.popDialog = function (options) {
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
    BaseView.prototype.waitDialog = function (dialog, options) {
        if (!(dialog instanceof Dialog)) {
            options = dialog;
            dialog = this.popDialog.call(this, options);
        } else if (!dialog.isShow) {
            dialog.show();
        }
        function btnClickHandler(dialog, type, args) {
            dialog.fire(type);
            dialog.hide();
        }
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
    BaseView.prototype.showDialog = function (dialog, options) {
        if (!(dialog instanceof Dialog)) {
            options = dialog;
            dialog = this.popDialog.call(this, options);
        } else if (!dialog.isShow) {
            dialog.show();
        }
        function btnClickHandler(dialog, type, args) {
            dialog.fire(type);
        }
        options = options || {};
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
            if (useDefault === false || useDefault instanceof require('mini-event/Event') && useDefault.isDefaultPrevented()) {
                return;
            }
            dialog && dialog.hide();
        }
        var blank = function () {
        };
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
    BaseView.prototype.waitAlert = function () {
        var dialog = this.alert.apply(this, arguments);
        var deferred = new Deferred();
        dialog.on('ok', deferred.resolver.resolve);
        return deferred.promise;
    };
    BaseView.prototype.waitConfirm = function () {
        var dialog = this.confirm.apply(this, arguments);
        var deferred = new Deferred();
        dialog.on('ok', deferred.resolver.resolve);
        dialog.on('cancel', deferred.resolver.reject);
        return deferred.promise;
    };
    BaseView.prototype.waitActionDialog = function () {
        var dialog = this.popActionDialog.apply(this, arguments);
        var deferred = new Deferred();
        dialog.on('actionloaded', deferred.resolver.resolve);
        dialog.on('actionloadfail', deferred.resolver.reject);
        dialog.on('actionloadabort', deferred.resolver.reject);
        return deferred.promise;
    };
    BaseView.prototype.refreshAuth = function () {
        var authPanel = this.get('authPanel');
        if (authPanel) {
            authPanel.initAuth();
        }
    };
    return BaseView;
});