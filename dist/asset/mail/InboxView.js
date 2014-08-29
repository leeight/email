define('mail/InboxView', [
    'require',
    'bat-ria/tpl!./inbox.tpl.html',
    'moment',
    'esui/lib',
    'er/locator',
    'bat-ria/mvc/ListView',
    'er/util'
], function (require) {
    require('bat-ria/tpl!./inbox.tpl.html');
    var moment = require('moment');
    var lib = require('esui/lib');
    var locator = require('er/locator');
    var ListView = require('bat-ria/mvc/ListView');
    function MailInboxView() {
        ListView.apply(this, arguments);
    }
    MailInboxView.prototype.template = 'TPL_mail_inbox';
    var tableFields = [
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
                        extra = '<span class="x-icon-attchments" title="' + item.attachments.join(' ') + '"></span>';
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
    MailInboxView.prototype.uiProperties = {
        table: {
            fields: tableFields,
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
    require('er/util').inherits(MailInboxView, ListView);
    return MailInboxView;
});