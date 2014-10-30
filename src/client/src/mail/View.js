/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseAction = require('bat-ria/mvc/BaseAction');
    var compose = require('common/compose');
    var u = require('underscore');
    var lib = require('esui/lib');
    var util = require('common/util');

    /**
     * Action构造函数
     *
     * @constructor
     */
    function MailView() {
        BaseAction.apply(this, arguments);
    }

    MailView.prototype.modelType = require('./ViewModel');
    MailView.prototype.viewType = require('./ViewView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    MailView.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);

        // 处理邮件正文内部链接的点击行为
        compose.handleClickAction(this.view);

        this.view.get('create').on('click',
            u.partial(util.composeMail, this.view, '撰写邮件', null));
        this.view.get('reply').on('click', this._replyMail, this);
        this.view.get('replyAll').on('click', this._replyAllMail, this);
        this.view.get('forward').on('click', this._forwardMail, this);
        this.view.get('delete').on('click', this._deleteMail, this);
        if (lib.g('pcs-retry')) {
            lib.on('pcs-retry', 'click', u.bind(this._pcsRetry, this));
        }

        document.title = this.model.get('email').subject + ' - 伊妹儿';
    };

    MailView.prototype._deleteMail = function() {
        if (!confirm('Are you sure?')) {
            return;
        }

        var email = this.model.get('email');
        var ids = [email.id];
        this.model.deleteMails(ids).then(u.bind(this.back, this));
    };

    /**
     * 后端的frontend.go很脆弱，需要编码的就记得编码，例如：
     * "=?utf-8?b?5p2O546J5YyX?=" <liyubei@baidu.com>
     */
    MailView.prototype._replyMail = function() {
        compose.reply(this.model.get('email'), this.view);
    };

    /**
     * 附件重新上传而已
     */
    MailView.prototype._pcsRetry = function() {
        var email = this.model.get('email');
        var uidl = email.uidl;
        this.model.pcsRetry(uidl).then(function() {
            alert('Done.');
        });
    };

    /**
     * 后端的frontend.go很脆弱，需要编码的就记得编码，例如：
     * "=?utf-8?b?5p2O546J5YyX?=" <liyubei@baidu.com>
     */
    MailView.prototype._replyAllMail = function() {
        compose.replyAll(this.model.get('email'), this.view);
    };


    // ---------- Forwarded message ----------
    // From: <noreply@chemistdirect.co.uk>
    // Date: Sun, Aug 24, 2014 at 1:23 PM
    // Subject: Thanks for your order ref 489538-74861
    // To: leeight@gmail.com
    // Message
    MailView.prototype._forwardMail = function() {
        compose.forward(this.model.get('email'), this.view);
    };

    require('er/util').inherits(MailView, BaseAction);
    return MailView;
});
