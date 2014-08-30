/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    // require template
    require('bat-ria/tpl!./inbox.tpl.html');
    var moment = require('moment');
    var lib = require('esui/lib');
    var locator = require('er/locator');
    var u = require('underscore');

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
            width: 10,
            title: 'ID',
            content: function (item) {
                return '<span title="' + item.uidl + '">#' + item.id + '</span>';
            }
        },
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
            width: 100,
            title: '发件人',
            content: function (item) {
                var from = item.from || {
                    name: '未知来源',
                    address: '未知来源'
                };
                return '<span title="' + from.address + '">' +
                    lib.encodeHTML(from.name || from.address) +
                '</span>';
            }
        },
        {
            field: 'subject',
            title: '标题',
            width: 700,
            content: function (item) {
                var extra = '';
                if (item.attachments && item.attachments.length) {
                    extra = '<span class="x-icon-attchments" title="' +
                    item.attachments.join(' ') + '"></span>';
                }

                var prefix = '';
                if (item.importance) {
                    prefix = '<i>' + item.importance + '</i>';
                }

                return prefix + '<a href="#/mail/view~id=' + item.id + '&uidl=' + item.uidl + '">' +
                    lib.encodeHTML(item.subject) + '</a>' + extra;
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

    var tableRows = {
        getRowClass: function(item, index) {
            if (!item.is_read) {
                return 'row-unread';
            }
        }
    }

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.uiProperties = {
        table: {
            fields: tableFields,
            rows: tableRows,
            sortable: false,
            columnResizable: true,
            select: 'multi'
        }
    };

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.uiEvents = {
        'refresh:click': function() {
            locator.reload();
        },
        'markAsRead:click': function() {
            var ids = u.map(this.get('table').getSelectedItems(), function(item) {
                return item.id;
            });
            this.model.markAsRead(ids).then(function(){
                locator.reload();
            })
        },
        'delete:click': function() {
            var ids = u.map(this.get('table').getSelectedItems(), function(item) {
                return item.id;
            });
            this.model.deleteMails(ids).then(function(){
                locator.reload();
            })
        },
        'table:select': function(evt) {
            var selectedIndex = evt.selectedIndex;
            if (selectedIndex && selectedIndex.length) {
                // this.get('archive').enable();
                this.get('markAsRead').enable();
                this.get('delete').enable();
            }
            else {
                // this.get('archive').disable();
                this.get('markAsRead').disable();
                this.get('delete').disable();
            }
        }
    };

    require('er/util').inherits(MailInboxView, ListView);
    return MailInboxView;
});
