/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./inbox.tpl.html');
    var locator = require('er/locator');
    var u = require('underscore');
    var notification = require('common/notification');
    var util = require('common/util');

    var ListView = require('bat-ria/mvc/ListView');

    /**
     * [Please Input View Description]
     *
     * @constructor
     */
    function MailInboxView() {
        ListView.apply(this, arguments);
    }

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.template = 'TPL_mail_inbox';

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.uiProperties = {
        table: util.mailListConfiguration(),
        cm: {
            displayText: '选择邮件',
            datasource: [
                { text: 'All' },
                { text: 'None' },
                { text: 'Read' },
                { text: 'Unread' },
                { text: 'Starred' },
                { text: 'Unstarred' }
            ]
        },
        actions: {
            displayText: '操作',
            datasource: [
                { text: '归档', action: 'archive' },
                { text: '标记已读', action: 'markAsRead' },
                { text: '添加标签', action: 'addLabel' },
                { text: '删除', action: 'delete' }
            ]
        },
        'unread-only': {
            'active': '@unreadOnly'
        }
    };

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.uiEvents = {
        'cm:select': function(e) {
            var table = this.get('table');
            var action = e.item.text;
            switch(e.item.text) {
                case 'All':
                    table.setAllRowSelected(true);
                    break;
                case 'None':
                    table.setAllRowSelected(false);
                    break;
                case 'Read':
                    u.each(table.datasource, function(x, i) {
                        table.setRowSelected(i, !!x.is_read);
                    });
                    break;
                case 'Unread':
                    u.each(table.datasource, function(x, i) {
                        table.setRowSelected(i, !x.is_read);
                    });
                    break;
                case 'Starred':
                    u.each(table.datasource, function(x, i) {
                        table.setRowSelected(i, !!x.is_star);
                    });
                    break;
                case 'Unstarred':
                    u.each(table.datasource, function(x, i) {
                        table.setRowSelected(i, !x.is_star);
                    });
                    break;
            }
        }
    };

    MailInboxView.prototype.enterDocument = function() {
        ListView.prototype.enterDocument.apply(this, arguments);
    };

    require('er/util').inherits(MailInboxView, ListView);
    return MailInboxView;
});
