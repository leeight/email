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
    var netdisk = require('common/netdisk');

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

        this.view.get('connectNetdisk').on('click', function() {
            netdisk.auth()
                .then(function(){
                    // OK
                }, function(){
                    // FAIL
                });
        });

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

        this.view.on('addStar', function(evt) {
            var element = evt.data;
            var id = element.getAttribute('data-id');

            model.addStar([id]).then(function() {
                element.className = 'fa fa-star';
            });
        });

        this.view.on('removeStar', function(evt) {
            var element = evt.data;
            var id = element.getAttribute('data-id');

            model.removeStar([id]).then(function() {
                element.className = 'fa fa-star-o';
            });
        });

        this.view.get('actions').on('select', function(e) {
            var ids = u.map(table.getSelectedItems(), function(item) {
                return item.id;
            });

            var action = e.item.action;
            if (action === 'markAsRead') {
                model.markAsRead(ids).then(locator.reload);
            }
            else if (action === 'addStar') {
                model.addStar(ids).then(locator.reload);
            }
            else if (action === 'delete') {
                model.deleteMails(ids).then(locator.reload);
            }
        });
    };

    require('er/util').inherits(MailInbox, ListAction);
    return MailInbox;
});
