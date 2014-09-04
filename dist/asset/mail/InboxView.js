define('mail/InboxView', [
    'require',
    'bat-ria/tpl!./inbox.tpl.html',
    'moment',
    'esui/lib',
    'er/locator',
    'underscore',
    'common/notification',
    'bat-ria/mvc/ListView',
    'er/util'
], function (require) {
    require('bat-ria/tpl!./inbox.tpl.html');
    var moment = require('moment');
    var lib = require('esui/lib');
    var locator = require('er/locator');
    var u = require('underscore');
    var notification = require('common/notification');
    var ListView = require('bat-ria/mvc/ListView');
    function MailInboxView() {
        ListView.apply(this, arguments);
    }
    MailInboxView.prototype.template = 'TPL_mail_inbox';
    var tableFields = [
            {
                field: 'id',
                width: 10,
                title: 'ID',
                content: function (item) {
                    return '<span title="' + item.uidl + '">#' + item.id + '</span>';
                }
            },
            {
                field: 'from',
                width: 100,
                title: '\u53D1\u4EF6\u4EBA',
                content: function (item) {
                    var from = item.from || {
                            name: '\u672A\u77E5\u6765\u6E90',
                            address: '\u672A\u77E5\u6765\u6E90'
                        };
                    return '<span title="' + from.address + '">' + lib.encodeHTML(from.name || from.address) + '</span>';
                }
            },
            {
                field: 'subject',
                title: '\u6807\u9898',
                width: 700,
                content: function (item) {
                    var extra = '';
                    if (item.attachments && item.attachments.length) {
                        extra = '<span class="x-icon-attchments" title="' + u.map(item.attachments, function (x) {
                            return x.name + ' (' + x.size + ')';
                        }).join(' ') + '"></span>';
                    }
                    var prefix = '';
                    if (item.importance) {
                        prefix = '<i>' + item.importance + '</i>';
                    }
                    return prefix + '<a href="#/mail/view~id=' + item.id + '&uidl=' + item.uidl + '">' + lib.encodeHTML(item.subject) + '</a>' + extra;
                }
            },
            {
                field: 'date',
                width: 100,
                title: '\u53D1\u9001\u65E5\u671F',
                content: function (item) {
                    return moment(new Date(item.date)).format('YYYY-MM-DD HH:mm:ss');
                }
            }
        ];
    var tableRows = {
            getRowClass: function (item, index) {
                if (!item.is_read) {
                    return 'row-unread';
                }
            }
        };
    MailInboxView.prototype.uiProperties = {
        table: {
            fields: tableFields,
            rows: tableRows,
            sortable: false,
            columnResizable: true,
            select: 'multi'
        }
    };
    MailInboxView.prototype.uiEvents = {
        'refresh:click': function () {
            locator.reload();
        }
    };
    MailInboxView.prototype.enterDocument = function () {
        ListView.prototype.enterDocument.apply(this, arguments);
        var subjects = [];
        u.each(this.model.get('tableData'), function (email) {
            if (email.is_read === 0) {
                subjects.push(email.subject);
            }
        });
        if (subjects.length) {
            notification.show('\u65B0\u90AE\u4EF6', subjects.join('\n'));
        }
    };
    require('er/util').inherits(MailInboxView, ListView);
    return MailInboxView;
});