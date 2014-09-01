/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListAction = require('bat-ria/mvc/ListAction');
    var util = require('common/util');
    var u = require('underscore');

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
     * inheritDoc
     *
     * @protected
     * @override
     */
    MailInbox.prototype.initBehavior = function () {
        ListAction.prototype.initBehavior.apply(this, arguments);

        this.view.get('create').on('click',
            u.partial(util.composeMail, this.view, '撰写邮件', null));

        document.title = '伊妹儿';
    };

    require('er/util').inherits(MailInbox, ListAction);
    return MailInbox;
});
