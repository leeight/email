/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./inbox.tpl.html');
    var moment = require('moment');

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

    var tableFields = [
        {
            field: 'id',
            title: 'ID',
            content: function (item) {
                return '#' + item.id;
            }
        },
        {
            field: 'from',
            title: '发件人',
            content: function (item) {
                var from = item.from;
                return '<span title="' + from.Address + '">' + (from.Name || from.Address) + '</span>';
            }
        },
        {
            field: 'subject',
            title: '标题',
            content: 'subject'
        },
        {
            field: 'date',
            title: '发送日期',
            content: function(item) {
                return moment(new Date(item.date)).format('YYYY-MM-DD HH:mm:ss')
            }
        }
    ];

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.uiProperties = {

        table: {
            fields: tableFields,
            sortable: true,
            columnResizable: true
        }

    };

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.uiEvents = {};

    require('er/util').inherits(MailInboxView, ListView);
    return MailInboxView;
});
