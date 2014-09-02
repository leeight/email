define('mail/ViewView', [
    'require',
    'bat-ria/tpl!./view.tpl.html',
    'bat-ria/mvc/BaseView',
    'er/util'
], function (require) {
    require('bat-ria/tpl!./view.tpl.html');
    var BaseView = require('bat-ria/mvc/BaseView');
    function MailViewView() {
        BaseView.apply(this, arguments);
    }
    MailViewView.prototype.template = 'TPL_mail_view';
    MailViewView.prototype.uiProperties = {};
    MailViewView.prototype.uiEvents = {};
    require('er/util').inherits(MailViewView, BaseView);
    return MailViewView;
});