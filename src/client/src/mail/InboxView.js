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
        // {
        //     field: 'id',
        //     width: 10,
        //     title: 'ID',
        //     content: function (item) {
        //         return '#' + item.id;
        //     }
        // },
        // {
        //     field: 'status',
        //     width: 20,
        //     title: '状态',
        //     content: function(item) {
        //         https://ssl.gstatic.com/ui/v1/star/star-lit4.png
        //         return '<img src="https://ssl.gstatic.com/ui/v1/star/star4.png" align="absmiddle">'
        //     }
        // },
        {
            field: 'from',
            width: 50,
            title: '发件人',
            content: function (item) {
                var from = item.from;
                return '<span title="' + from.Address + '">' + (from.Name || from.Address) + '</span>';
            }
        },
        {
            field: 'subject',
            title: '标题',
            width: 800,
            content: function (item) {
                return '<a href="#/mail/view~id=' + item.id + '">' + item.subject + '</a>';
            }
        },
        {
            field: 'date',
            width: 100,
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
