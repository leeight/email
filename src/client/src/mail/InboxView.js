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
        table: util.mailListConfiguration()
    };

    /**
     * @inheritDoc
     */
    MailInboxView.prototype.uiEvents = {
        'refresh:click': function() {
            locator.reload();
        }
    };

    MailInboxView.prototype.enterDocument = function() {
        ListView.prototype.enterDocument.apply(this, arguments);

        // 提示新邮件
        var subjects = [];
        u.each(this.model.get('tableData'), function(email) {
            if (email.is_read === 0) {
                subjects.push(email.subject);
            }
        });
        if (subjects.length) {
            notification.show('新邮件', subjects.join('\n'));
        }
    };

    require('er/util').inherits(MailInboxView, ListView);
    return MailInboxView;
});
