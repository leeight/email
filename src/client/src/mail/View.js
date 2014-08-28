/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseAction = require('bat-ria/mvc/BaseAction');
    var lib = require('esui/lib');
    var mail = require('encoding/mail');
    var u = require('underscore');
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
        lib.g('mail-body').onmousedown = function(opt_evt) {
            var evt = opt_evt || window.event;
            var node = evt.target || evt.srcElement;
            if (node.nodeType === 1 && node.nodeName === 'A') {
                if (/^mailto:/.test(node.href)) {
                    node.href = '#/mail/compose~to=' + node.href.replace('mailto:', '')
                }
                else if (node.target !== '_blank') {
                    node.target = '_blank';
                }
            }
        }

        this.view.get('reply').on('click', this._replyMail, this);
        this.view.get('replyAll').on('click', this._replyMail, this);
        this.view.get('forward').on('click', this._forwardMail, this);
    };

    /**
     * 后端的frontend.go很脆弱，需要编码的就记得编码，例如：
     * "=?utf-8?b?5p2O546J5YyX?=" <liyubei@baidu.com>
     */
    MailView.prototype._replyMail = function() {
        var email = this.model.get('email');

        var subject = email.subject;
        var message = '<br>' +
            'On ' + email.date + ', &lt;' + email.from.address + '&gt; wrote:' +
            '<br><blockquote>\n' + email.message + '\n</blockquote>';
        var to = [ mail.encodeAddress(email.from) ];
        var cc = [];
        u.each(email.to || [], function(item){
            cc.push(mail.encodeAddress(item));
        });
        u.each(email.cc || [], function(item){
            cc.push(mail.encodeAddress(item));
        });
        if (!/^(RE|回复)[:：]/i.test(email.subject)) {
            subject = '回复:' + subject;
        }

        util.composeMail(this.view, '回复邮件', {
            to: to.join(', '),
            cc: cc.join(', '),
            subject: subject,
            message: message
        });
    }


    // ---------- Forwarded message ----------
    // From: <noreply@chemistdirect.co.uk>
    // Date: Sun, Aug 24, 2014 at 1:23 PM
    // Subject: Thanks for your order ref 489538-74861
    // To: leeight@gmail.com
    //
    // Message
    MailView.prototype._forwardMail = function() {
        var email = this.model.get('email');

        var subject = email.subject;
        var message = '<br>' +
            '---------- Forwarded message ----------<br>\n' +
            'From: &lt;' + email.from.address + '&gt;<br>\n' +
            'To: ' + mail.dumpAddress(email.to) + '<br>\n' +
            'Subject: ' + subject + '<br>\n' +
            'Date: ' + email.date + '<br>\n' +
            '<br><br>\n' + email.message + '';

        if (!/^(Fwd|转发)[:：]/i.test(email.subject)) {
            subject = '转发:' + subject;
        }

        util.composeMail(this.view, '转发邮件', {
            to: '',
            cc: '',
            subject: subject,
            message: message
        });
    }

    require('er/util').inherits(MailView, BaseAction);
    return MailView;
});
