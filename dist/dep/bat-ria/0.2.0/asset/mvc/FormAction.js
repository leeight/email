define('bat-ria/mvc/FormAction', [
    'require',
    'er/util',
    'underscore',
    'er/Deferred',
    './BaseAction'
], function (require) {
    var util = require('er/util');
    var u = require('underscore');
    var Deferred = require('er/Deferred');
    var BaseAction = require('./BaseAction');
    function FormAction() {
        BaseAction.apply(this, arguments);
    }
    util.inherits(FormAction, BaseAction);
    FormAction.prototype.toastMessage = '';
    FormAction.prototype.getToastMessage = function (result) {
        var message = this.toastMessage;
        if (message == null) {
            return '';
        }
        if (message) {
            return u.template(message, result || {});
        } else {
            return '\u4FDD\u5B58\u6210\u529F';
        }
    };
    FormAction.prototype.handleSubmitResult = function (result) {
        var toast = this.getToastMessage(result);
        if (toast) {
            this.view.showToast(toast);
        }
        if (typeof this.redirectAfterSubmit === 'function') {
            this.redirectAfterSubmit(result);
        }
    };
    FormAction.prototype.backLocation = null;
    FormAction.prototype.redirectAfterSubmit = function (result) {
        this.back(this.backLocation, true);
    };
    FormAction.prototype.handleSubmitError = function (message) {
        if (message && message.field) {
            this.view.notifyErrors(message.field);
            this.view.handleValidateInvalid();
        }
        this.view.showToast('\u4FDD\u5B58\u5931\u8D25');
    };
    FormAction.prototype.handleLocalValidationErrors = function (errors) {
        if (typeof errors === 'string') {
            this.view.alert(errors, '\u7CFB\u7EDF\u63D0\u793A');
        } else if (typeof errors === 'object') {
            this.view.notifyErrors(errors);
        }
        return errors;
    };
    FormAction.prototype.reset = function () {
        var reset = this.fire('reset');
        if (!reset.isDefaultPrevented()) {
            this.view.rollbackFormData(this.model.getDefaultData());
        }
    };
    FormAction.prototype.cancelConfirmTitle = '\u786E\u8BA4\u53D6\u6D88\u7F16\u8F91';
    FormAction.prototype.getCancelConfirmTitle = function () {
        return this.cancelConfirmTitle;
    };
    FormAction.prototype.cancelConfirmMessage = '\u53D6\u6D88\u7F16\u8F91\u5C06\u4E0D\u4FDD\u7559\u5DF2\u7ECF\u586B\u5199\u7684\u6570\u636E\uFF0C\u786E\u5B9A\u7EE7\u7EED\u5417\uFF1F';
    FormAction.prototype.getCancelConfirmMessage = function () {
        return this.cancelConfirmMessage;
    };
    FormAction.prototype.cancel = function () {
        var submitCancelEvent = this.fire('submitcancel');
        var handleFinishEvent = this.fire('aftercancel');
        if (!handleFinishEvent.isDefaultPrevented() && !submitCancelEvent.isDefaultPrevented()) {
            this.redirectAfterCancel();
        }
    };
    FormAction.prototype.cancelEdit = function () {
        var formData = this.view.getFormData();
        if (this.model.isFormDataChanged(formData)) {
            var options = {
                    title: this.getCancelConfirmTitle(),
                    content: this.getCancelConfirmMessage()
                };
            this.view.waitConfirm(options).then(u.bind(this.cancel, this));
        } else {
            this.cancel();
        }
    };
    FormAction.prototype.redirectAfterCancel = function () {
        this.back(this.backLocation, true);
    };
    FormAction.prototype.submit = function (submitData) {
        var handleBeforeSubmit = this.fire('beforesubmit');
        if (!handleBeforeSubmit.isDefaultPrevented()) {
            try {
                var submitRequester = this.model.submitRequester;
                return submitRequester(submitData).then(u.bind(this.handleSubmitResult, this), u.bind(this.handleSubmitError, this));
            } catch (ex) {
                return Deferred.rejected(ex);
            }
        }
    };
    FormAction.prototype.beforeValidate = function (submitData) {
    };
    FormAction.prototype.afterValidate = function (submitData) {
    };
    FormAction.prototype.validate = function (submitData) {
        var localViewValidationResult = this.view.validate();
        var localModelValidationResult = this.model.validateSubmitData(submitData);
        if (localViewValidationResult && localModelValidationResult === true) {
            return Deferred.resolved(submitData);
        }
        if (localModelValidationResult !== true) {
            this.handleLocalValidationErrors(localModelValidationResult);
        }
        this.view.handleValidateInvalid();
        return Deferred.rejected();
    };
    FormAction.prototype.submitEdit = function () {
        this.view.disableSubmit();
        var formData = this.view.getFormData();
        var submitData = this.model.getSubmitData(formData);
        require('er/Deferred').when(this.beforeValidate(submitData)).then(u.bind(u.partial(this.validate, submitData), this)).then(u.bind(u.partial(this.afterValidate, submitData), this)).then(u.bind(u.partial(this.submit, submitData), this)).ensure(u.bind(this.view.enableSubmit, this.view));
    };
    FormAction.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);
        this.view.on('submit', this.submitEdit, this);
        this.view.on('cancel', this.cancelEdit, this);
        this.view.on('reset', this.reset, this);
    };
    return FormAction;
});