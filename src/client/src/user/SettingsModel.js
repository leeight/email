/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var FormModel = require('bat-ria/mvc/FormModel');
    // var datasource = require('er/datasource');
    var api = require('common/config').api;
    // var batUtil = require('bat-ria/util');

    /**
     * [Please Input Model Description]
     *
     * @constructor
     */
    function UserSettingsModel() {
        FormModel.apply(this, arguments);

        // 表单数据请求器
        this.formRequester = api.userSettingsRead;

        // 表单提交请求器 (*)
        this.submitRequester = api.userSettingsUpdate;
    }

    /**
     * @inheritDoc
     */
    UserSettingsModel.prototype.datasource = {
        formData: {
            retrieve: function(model) {
                return model.formRequester().then(function(result){
                    if (result.pop3 && result.pop3.port) {
                        result.pop3.hostname = result.pop3.host + ':' + result.pop3.port;
                    }

                    if (result.smtp && result.smtp.port) {
                        result.smtp.hostname = result.smtp.host + ':' + result.smtp.port;
                    }

                    return result;
                })
            },
            dump: false
        }
    };

    /**
     * @inheritDoc
     */
    UserSettingsModel.prototype.getDefaultArgs = function() {
        return {
            id: this.get('id')
        };
    };

    /**
     * @inheritDoc
     */
    UserSettingsModel.prototype.getExtraData = function () {
        return {};
    };

    // return模块
    require('er/util').inherits(UserSettingsModel, FormModel);
    return UserSettingsModel;
});
