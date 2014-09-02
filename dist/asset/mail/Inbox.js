define('mail/Inbox', [
    'require',
    'bat-ria/mvc/ListAction',
    'common/util',
    'underscore',
    './InboxModel',
    './InboxView',
    'er/util'
], function (require) {
    var ListAction = require('bat-ria/mvc/ListAction');
    var util = require('common/util');
    var u = require('underscore');
    function MailInbox() {
        ListAction.apply(this, arguments);
    }
    MailInbox.prototype.modelType = require('./InboxModel');
    MailInbox.prototype.viewType = require('./InboxView');
    MailInbox.prototype.initBehavior = function () {
        ListAction.prototype.initBehavior.apply(this, arguments);
        this.view.get('create').on('click', u.partial(util.composeMail, this.view, '\u64B0\u5199\u90AE\u4EF6', null));
        document.title = '\u4F0A\u59B9\u513F';
    };
    require('er/util').inherits(MailInbox, ListAction);
    return MailInbox;
});