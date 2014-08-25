/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var ListAction = require('bat-ria/mvc/ListAction');

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

        // bind event handlers here
    };

    require('er/util').inherits(MailInbox, ListAction);
    return MailInbox;
});
