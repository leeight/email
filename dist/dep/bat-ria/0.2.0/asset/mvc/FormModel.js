define('bat-ria/mvc/FormModel', [
    'require',
    './BaseModel',
    'underscore',
    'er/util',
    'er/datasource',
    './rule'
], function (require) {
    var BaseModel = require('./BaseModel');
    var u = require('underscore');
    var util = require('er/util');
    var datasource = require('er/datasource');
    function FormModel() {
        BaseModel.apply(this, arguments);
    }
    util.inherits(FormModel, BaseModel);
    FormModel.prototype.formRequester = null;
    FormModel.prototype.submitRequester = null;
    FormModel.prototype.defaultArgs = {};
    FormModel.prototype.getDefaultArgs = function () {
        return this.defaultArgs;
    };
    FormModel.prototype.defaultDatasource = {
        rule: datasource.constant(require('./rule')),
        formData: {
            retrieve: function (model) {
                if (model.get('formData')) {
                    return model.get('formData');
                } else {
                    var formRequester = model.formRequester;
                    if (formRequester) {
                        return formRequester(model.getDefaultArgs());
                    } else {
                        return {};
                    }
                }
            },
            dump: false
        }
    };
    FormModel.prototype.getDefaultData = function () {
        return this.get('formData');
    };
    FormModel.prototype.getSubmitData = function (formData) {
        var data = u.extend(formData, this.getExtraData());
        data = this.filterData(data);
        return data;
    };
    FormModel.prototype.getExtraData = function () {
        return {};
    };
    FormModel.prototype.filterData = function (data) {
        return data;
    };
    FormModel.prototype.isFormDataChanged = function (present) {
        return false;
    };
    FormModel.prototype.validateSubmitData = function (submitData) {
        return true;
    };
    return FormModel;
});