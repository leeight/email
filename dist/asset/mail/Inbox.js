define('mail/Inbox', [
    'require',
    'bat-ria/mvc/ListAction',
    'common/util',
    'underscore',
    'er/locator',
    './InboxModel',
    './InboxView',
    'er/util'
], function (require) {
    var ListAction = require('bat-ria/mvc/ListAction');
    var util = require('common/util');
    var u = require('underscore');
    var locator = require('er/locator');
    function MailInbox() {
        ListAction.apply(this, arguments);
    }
    MailInbox.prototype.modelType = require('./InboxModel');
    MailInbox.prototype.viewType = require('./InboxView');
    MailInbox.prototype.initBehavior = function () {
        ListAction.prototype.initBehavior.apply(this, arguments);
        this.view.get('create').on('click', u.partial(util.composeMail, this.view, '\u64B0\u5199\u90AE\u4EF6', null));
        document.title = '\u4F0A\u59B9\u513F';
        this.view.on('batchmodify', function (e) {
            var ids = u.map(e.selectedItems, function (item) {
                    return item.id;
                });
            var action = e.action;
            if (action === 'markAsRead') {
                this.model.markAsRead(ids).then(function () {
                    locator.reload();
                });
            } else if (action === 'delete') {
                this.model.deleteMails(ids).then(function () {
                    locator.reload();
                });
            }
        });
    };
    require('er/util').inherits(MailInbox, ListAction);
    return MailInbox;
});