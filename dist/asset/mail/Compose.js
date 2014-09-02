define('mail/Compose', [
    'require',
    'bat-ria/mvc/FormAction',
    'er/util',
    './ComposeModel',
    './ComposeView'
], function (require) {
    var FormAction = require('bat-ria/mvc/FormAction');
    var util = require('er/util');
    function MailCompose() {
        FormAction.apply(this, arguments);
    }
    MailCompose.prototype.modelType = require('./ComposeModel');
    MailCompose.prototype.viewType = require('./ComposeView');
    MailCompose.prototype.initBehavior = function () {
        FormAction.prototype.initBehavior.apply(this, arguments);
    };
    require('er/util').inherits(MailCompose, FormAction);
    return MailCompose;
});