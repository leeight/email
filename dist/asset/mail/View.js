define('mail/View', [
    'require',
    'bat-ria/mvc/BaseAction',
    'esui/lib',
    'encoding/mail',
    'underscore',
    'common/util',
    './ViewModel',
    './ViewView',
    'er/util'
], function (require) {
    var BaseAction = require('bat-ria/mvc/BaseAction');
    var lib = require('esui/lib');
    var mail = require('encoding/mail');
    var u = require('underscore');
    var util = require('common/util');
    function MailView() {
        BaseAction.apply(this, arguments);
    }
    MailView.prototype.modelType = require('./ViewModel');
    MailView.prototype.viewType = require('./ViewView');
    MailView.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);
        var view = this.view;
        $('#mail-body a, .list-summary-table a').click(function () {
            var node = this;
            if (/javascript:/.test(node.href)) {
                return;
            }
            if (/^mailto:/.test(node.href)) {
                var address = node.title;
                var name = node.innerHTML;
                util.composeMail(view, null, {
                    to: [{
                            name: name,
                            address: address
                        }]
                });
                return false;
            } else if (node.target !== '_blank') {
                node.target = '_blank';
            }
        });
        this.view.get('reply').on('click', this._replyMail, this);
        this.view.get('replyAll').on('click', this._replyAllMail, this);
        this.view.get('forward').on('click', this._forwardMail, this);
        this.view.get('delete').on('click', this._deleteMail, this);
        document.title = this.model.get('email').subject + ' - \u4F0A\u59B9\u513F';
    };
    MailView.prototype._deleteMail = function () {
        if (!confirm('Are you sure?')) {
            return;
        }
        var email = this.model.get('email');
        var ids = [email.id];
        this.model.deleteMails(ids).then(u.bind(this.back, this));
    };
    MailView.prototype._replyMail = function () {
        var email = this.model.get('email');
        var subject = email.subject;
        var message = '<br>' + 'On ' + email.date + ', &lt;' + email.from.address + '&gt; wrote:' + '<br><blockquote>\n' + email.message + '\n</blockquote>';
        var to = [email.from];
        var cc = [];
        u.each(email.to || [], function (item) {
            cc.push(item);
        });
        u.each(email.cc || [], function (item) {
            cc.push(item);
        });
        if (!/^(RE|回复)[:：]/i.test(email.subject)) {
            subject = '\u56DE\u590D: ' + subject;
        }
        util.composeMail(this.view, '\u56DE\u590D\u90AE\u4EF6', {
            to: to,
            cc: cc,
            subject: subject,
            message: message
        });
    };
    MailView.prototype._replyAllMail = function () {
        var email = this.model.get('email');
        var subject = email.subject;
        var message = '<br>' + 'On ' + email.date + ', &lt;' + email.from.address + '&gt; wrote:' + '<br><blockquote>\n' + email.message + '\n</blockquote>';
        var to = [email.from];
        var cc = [];
        u.each(email.to || [], function (item) {
            to.push(item);
        });
        u.each(email.cc || [], function (item) {
            cc.push(item);
        });
        if (!/^(RE|回复|答复)[:：]/i.test(email.subject)) {
            subject = '\u56DE\u590D: ' + subject;
        }
        util.composeMail(this.view, '\u56DE\u590D\u90AE\u4EF6', {
            to: to,
            cc: cc,
            subject: subject,
            message: message
        });
    };
    MailView.prototype._forwardMail = function () {
        var email = this.model.get('email');
        var subject = email.subject;
        var message = '<br>' + '---------- Forwarded message ----------<br>\n' + 'From: &lt;' + email.from.address + '&gt;<br>\n' + 'To: ' + mail.dumpAddress(email.to) + '<br>\n' + 'Subject: ' + subject + '<br>\n' + 'Date: ' + email.date + '<br>\n' + '<br><br>\n' + email.message + '';
        if (!/^(Fwd|转发)[:：]/i.test(email.subject)) {
            subject = '\u8F6C\u53D1: ' + subject;
        }
        var attachments = u.map(email.attachments, function (item) {
                return {
                    title: item,
                    value: email.uidl + '/att/' + item,
                    checked: true
                };
            });
        util.composeMail(this.view, '\u8F6C\u53D1\u90AE\u4EF6', {
            to: '',
            cc: '',
            subject: subject,
            message: message,
            attachments: attachments
        });
    };
    require('er/util').inherits(MailView, BaseAction);
    return MailView;
});