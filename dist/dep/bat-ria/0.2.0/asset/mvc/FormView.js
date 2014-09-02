define('bat-ria/mvc/FormView', [
    'require',
    'er/util',
    './BaseView',
    'underscore',
    'esui/lib',
    'esui/validator/Validity',
    'esui/validator/ValidityState'
], function (require) {
    var util = require('er/util');
    var BaseView = require('./BaseView');
    var u = require('underscore');
    var lib = require('esui/lib');
    function FormView() {
        BaseView.apply(this, arguments);
    }
    util.inherits(FormView, BaseView);
    FormView.prototype.getFormData = function () {
        var form = this.get('form');
        return u.extend({}, form ? form.getData() : {}, this.getExtraFormData());
    };
    FormView.prototype.getExtraFormData = function () {
        return {};
    };
    FormView.prototype.rollbackFormData = function (defaultData) {
        this.setFormData(defaultData);
    };
    FormView.prototype.setFormData = function (formData) {
        var form = this.get('form');
        var inputs = form.getInputControls();
        u.each(inputs, function (input, index) {
            var key = input.name;
            if (formData) {
                if (u.has(formData, key)) {
                    input.setValue(formData[key]);
                }
            }
        });
        this.setExtraFormData(formData);
    };
    FormView.prototype.setExtraFormData = function (formData) {
        return;
    };
    FormView.prototype.validate = function () {
        var form = this.get('form');
        var isAutoValidate = form.get('autoValidate');
        if (!isAutoValidate) {
            return true;
        }
        return form.validate();
    };
    FormView.prototype.notifyErrors = function (errors) {
        if (typeof errors !== 'object') {
            return;
        }
        var Validity = require('esui/validator/Validity');
        var ValidityState = require('esui/validator/ValidityState');
        var form = this.get('form');
        u.each(errors, function (message, field) {
            var state = new ValidityState(false, message);
            var validity = new Validity();
            validity.addState('invalid', state);
            var input = form.getInputControls(field)[0];
            if (input && typeof input.showValidity === 'function') {
                input.showValidity(validity);
            }
        });
    };
    function reset() {
        this.fire('reset');
    }
    function cancelEdit() {
        this.fire('cancel');
    }
    function submit(e) {
        e.preventDefault();
        this.fire('submit');
    }
    function scrollTo(element) {
        var offset = lib.getOffset(element);
        if (lib.page.getScrollTop() > offset.top) {
            document.body.scrollTop = document.documentElement.scrollTop = offset.top - 10;
        }
    }
    FormView.prototype.handleValidateInvalid = function () {
        var me = this;
        var form = this.get('form');
        u.some(form.getInputControls(), function (input, index) {
            if (input.hasState('validity-invalid')) {
                var e = me.fire('scrolltofirsterror', { firstErrValidity: input });
                if (!e.isDefaultPrevented()) {
                    scrollTo(input.main);
                }
                return true;
            }
        });
    };
    FormView.prototype.bindEvents = function () {
        var form = this.get('form');
        if (form) {
            form.on('beforevalidate', submit, this);
        }
        var resetButton = this.get('reset');
        if (resetButton) {
            resetButton.on('click', reset, this);
        }
        var cancelButton = this.get('cancel');
        if (cancelButton) {
            cancelButton.on('click', cancelEdit, this);
        }
        BaseView.prototype.bindEvents.apply(this, arguments);
    };
    FormView.prototype.disableSubmit = function () {
        if (this.viewContext) {
            this.getGroup('submit').disable();
        }
    };
    FormView.prototype.enableSubmit = function () {
        if (this.viewContext) {
            this.getGroup('submit').enable();
        }
    };
    return FormView;
});