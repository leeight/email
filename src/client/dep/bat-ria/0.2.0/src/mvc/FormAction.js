/**
 * @file 表单类型`Action`基类
 * @author chestnutchen(chenli11@baidu.com)
 */

define(function (require) {
    var util = require('er/util');
    var u = require('underscore');
    var Deferred = require('er/Deferred');
    var BaseAction = require('./BaseAction');

    /**
     * 表单类型`Action`基类
     *
     * @extends BaseAction
     * @constructor
     */
    function FormAction() {
        BaseAction.apply(this, arguments);
    }

    util.inherits(FormAction, BaseAction);

    /**
     * 设置表单提交成功后显示的信息，如果值为`null`或`undefined`则表示不显示任何信息
     *
     * 如果该字段有内容，则系统使用该字段与提交表单后服务器返回的数据进行模板格式化，
     * 因此可以使用服务器返回的字段为占位符。模板使用`underscore.template`方法
     *
     * @type {string | false | null}
     */
    FormAction.prototype.toastMessage = '';

    /**
     * 获取表单提交成功后显示的信息
     *
     * 默认提示信息为“保存成功”
     *
     * @param {Object} result 提交后服务器端返回的信息
     * @return {string}
     */
    FormAction.prototype.getToastMessage = function (result) {
        var message = this.toastMessage;
        if (message == null) {
            return '';
        }

        if (message) {
            return u.template(message, result || {});
        }
        else {
            return '保存成功';
        }
    };

    /**
     * 处理提交数据成功后的返回
     *
     * @param {Object} result 提交成功后返回的内容
     */
    FormAction.prototype.handleSubmitResult = function (result) {
        var toast = this.getToastMessage(result);
        if (toast) {
            this.view.showToast(toast);
        }
        if (typeof this.redirectAfterSubmit === 'function') {
            this.redirectAfterSubmit(result);
        }
    };

    /**
     * 默认提交/取消后跳转的路径
     * @type {string}
     */
    FormAction.prototype.backLocation = null;

    /**
     * 执行提交成功后的跳转操作
     * 在有referrer的情况下跳转至referrer
     * 在没有referrer的情况下history.back()
     *
     * 可在业务action里边重写
     *
     * @param {Object} result 提交后服务器返回的数据
     */
    FormAction.prototype.redirectAfterSubmit = function (result) {
        this.back(this.backLocation, true);
    };

    /**
     * 处理提交错误
     *
     * @param {Object} message 失败时的message对象
     */
    FormAction.prototype.handleSubmitError = function (message) {
        if (message && message.field) {
            this.view.notifyErrors(message.field);
            this.view.handleValidateInvalid();
        }
        this.view.showToast('保存失败');
    };

    /**
     * 处理本地的验证错误
     * 没有name的controls请自行扩展处理
     *
     * @param {object | string} errors 本地验证得到的错误信息
     *        object视为`FieldError`，string视为`GlobalError`
     *        object的格式：
     *        {
     *            name1: errorMessage1,
     *            name2: errorMessage2
     *        }
     *
     * @return {Mixed} 本地验证得到的错误信息
     */
    FormAction.prototype.handleLocalValidationErrors = function (errors) {
        if (typeof errors === 'string') {
            this.view.alert(errors, '系统提示');
        }
        else if (typeof errors === 'object') {
            this.view.notifyErrors(errors);
        }
        return errors;
    };

    /**
     * 重置的操作
     */
    FormAction.prototype.reset = function () {
        var reset = this.fire('reset');
        if (!reset.isDefaultPrevented()) {
            this.view.rollbackFormData(this.model.getDefaultData());
        }
    };

    /**
     * 设置取消编辑时的提示信息标题
     *
     * @type {string}
     */
    FormAction.prototype.cancelConfirmTitle = '确认取消编辑';

    /**
     * 获取取消编辑时的提示信息标题
     *
     * @return {string}
     */
    FormAction.prototype.getCancelConfirmTitle = function () {
        return this.cancelConfirmTitle;
    };

    /**
     * 设置取消编辑时的提示信息内容
     *
     * @type {string}
     */
    FormAction.prototype.cancelConfirmMessage =
        '取消编辑将不保留已经填写的数据，确定继续吗？';

    /**
     * 获取取消编辑时的提示信息内容
     *
     * @return {string}
     */
    FormAction.prototype.getCancelConfirmMessage = function () {
        return this.cancelConfirmMessage;
    };

    /**
     * 取消编辑的操作
     *
     * @fires submitcancel
     * @fires aftercancel
     */
    FormAction.prototype.cancel = function () {
        var submitCancelEvent = this.fire('submitcancel');
        var handleFinishEvent = this.fire('aftercancel');

        if (!handleFinishEvent.isDefaultPrevented() && !submitCancelEvent.isDefaultPrevented()) {
            this.redirectAfterCancel();
        }
    };

    /**
     * 取消编辑时的确认提示
     */
    FormAction.prototype.cancelEdit = function () {
        var formData = this.view.getFormData();

        if (this.model.isFormDataChanged(formData)) {
            var options = {
                title: this.getCancelConfirmTitle(),
                content: this.getCancelConfirmMessage()
            };
            this.view.waitConfirm(options)
                .then(u.bind(this.cancel, this));
        }
        else {
            this.cancel();
        }
    };

    /**
     * 在取消编辑后重定向
     * 在有referrer的情况下跳转至referrer
     * 在没有referrer的情况下history.back()
     *
     * 可在业务action里边重写
     */
    FormAction.prototype.redirectAfterCancel = function () {
        this.back(this.backLocation, true);
    };

    /**
     * 提交表单
     *
     * @param {object} submitData 表单数据
     * @return {meta.Promise}
     */
    FormAction.prototype.submit = function (submitData) {
        var handleBeforeSubmit = this.fire('beforesubmit');
        if (!handleBeforeSubmit.isDefaultPrevented()) {
            try {
                var submitRequester = this.model.submitRequester;
                return submitRequester(submitData)
                    .then(
                        u.bind(this.handleSubmitResult, this),
                        u.bind(this.handleSubmitError, this)
                    );
            }
            catch (ex) {
                return Deferred.rejected(ex);
            }
        }
    };

    /**
     * 校验表单前可扩展的操作，在提交之前做`异步`的校验
     * 比如弹个框“提交有风险，是否要提交”之类
     *
     * @param {object} submitData 最终要提交的数据
     * @return {Mixed}
     *      当且仅当返回Deferred.rejected()阻止后续流程
     *      其他任意返回结果均与Deferred.resolved()等效
     */
    FormAction.prototype.beforeValidate = function (submitData) {};

    /**
     * 校验表单后可扩展的动作，在校验之后做`异步`的处理
     * 比如弹个框“提交仍有风险，是否要提交”之类
     *
     * @param {object} submitData 最终要提交的数据
     * @return {Mixed}
     *      当且仅当返回Deferred.rejected()阻止后续流程
     *      其他任意返回结果均与Deferred.resolved()等效
     */
    FormAction.prototype.afterValidate = function (submitData) {};

    /**
     * 进行校验，如果设置了Form的`autoValidate`则先进行表单控件自校验，否则只做自定义校验
     *
     * @return {meta.Promise}
     */
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

    /**
     * 此处为点击提交按钮后、表单校验前的准备
     * 主要逻辑是锁定提交，在校验通过并完成提交操作后释放表单的提交操作
     *
     * 提交流程：
     * disableSubmit ->
     * beforeValidate ->
     * validate ->
     * afterValidate ->
     * sumbmit ->
     * enableSubmit
     *
     * 可针对业务需求扩展beforeValidate、afterValidate
     * validate、submit若与业务有冲突，也可自行修改，但不推荐
     */
    FormAction.prototype.submitEdit = function () {
        this.view.disableSubmit();
        var formData = this.view.getFormData();
        var submitData = this.model.getSubmitData(formData);

        require('er/Deferred')
            .when(this.beforeValidate(submitData))
            .then(u.bind(u.partial(this.validate, submitData), this))
            .then(u.bind(u.partial(this.afterValidate, submitData), this))
            .then(u.bind(u.partial(this.submit, submitData), this))
            .ensure(u.bind(this.view.enableSubmit, this.view));
    };

    /**
     * 初始化交互行为
     *
     * @protected
     * @override
     */
    FormAction.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);
        this.view.on('submit', this.submitEdit, this);
        this.view.on('cancel', this.cancelEdit, this);
        this.view.on('reset', this.reset, this);
    };
    
    return FormAction;
});
