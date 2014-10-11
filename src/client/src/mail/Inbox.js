/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListAction = require('bat-ria/mvc/ListAction');
    var util = require('common/util');
    var u = require('underscore');
    var URL = require('er/URL');
    var locator = require('er/locator');

    /**
     * Action构造函数
     *
     * @constructor
     */
    function MailInbox() {
        ListAction.apply(this, arguments);
    }

    MailInbox.prototype.modelType = require('./InboxModel');
    MailInbox.prototype.viewType = require('./InboxView');


    /**
     * 进行查询引起的重定向操作
     *
     * @param {Object} args 查询参数
     */
    MailInbox.prototype.redirectForSearch = function (args) {
        var path = '/mail/search';
        var url = URL.withQuery(path, args);
        this.redirect(url, { force: true });
    };

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    MailInbox.prototype.initBehavior = function () {
        ListAction.prototype.initBehavior.apply(this, arguments);

        this.view.get('create').on('click',
            u.partial(util.composeMail, this.view, '撰写邮件', null));
        this.view.get('refresh').on('click', this.reload, this);
        this.view.get('unread-only').on('click', function() {
            var url = this.context.url;
            var path = url.getPath();
            var query = url.getQuery();

            var value = this.view.get('unread-only').getValue();
            if (value === '1') {
                query.unreadOnly = value;
            } else {
                query = u.omit(query, 'unreadOnly');
            }
            query = u.omit(query, 'pageNo');

            var url = URL.withQuery(path, query);
            this.redirect(url, { force: true });
        }, this);

        document.title = '伊妹儿';


        var table = this.view.get('table');
        var model = this.model;
        // this.view.on('batchmodify', function(e) {
        //     var ids = u.map(table.getSelectedItems(), function(item) {
        //         return item.id;
        //     });

        //     var action = e.action;
        //     if (action === 'delete') {
        //         model.deleteMails(ids).then(function(){
        //             locator.reload();
        //         });
        //     }
        // });

        this.view.get('actions').on('select', function(e) {
            var ids = u.map(table.getSelectedItems(), function(item) {
                return item.id;
            });

            var action = e.item.action;
            if (action === 'markAsRead') {
                model.markAsRead(ids).then(function(){
                    locator.reload();
                });
            }
            else if (action === 'delete') {
                model.deleteMails(ids).then(function(){
                    locator.reload();
                });
            }
        });
    };

    require('er/util').inherits(MailInbox, ListAction);
    return MailInbox;
});
