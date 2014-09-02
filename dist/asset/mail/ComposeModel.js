define('mail/ComposeModel', [
    'require',
    'bat-ria/mvc/FormModel',
    'er/datasource',
    'common/config',
    'bat-ria/util',
    'er/util'
], function (require) {
    var FormModel = require('bat-ria/mvc/FormModel');
    var datasource = require('er/datasource');
    var api = require('common/config').api;
    var batUtil = require('bat-ria/util');
    function MailComposeModel() {
        FormModel.apply(this, arguments);
        this.submitRequester = api.mailPost;
    }
    MailComposeModel.prototype.datasource = null;
    MailComposeModel.prototype.getDefaultArgs = function () {
        return { id: this.get('id') };
    };
    MailComposeModel.prototype.getExtraData = function () {
        return {};
    };
    require('er/util').inherits(MailComposeModel, FormModel);
    return MailComposeModel;
});