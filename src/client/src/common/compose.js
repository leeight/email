/**
 * @file ../client/src/common/compose.js ~ 2014/09/16 21:25:04
 * @author leeight(liyubei@baidu.com)
 * 邮件回复，转发相关的功能
 **/
define(function(require) {
var lib = require('esui/lib');
var mail = require('encoding/mail');
var u = require('underscore');
var util = require('common/util');
var encoding = require('encoding/mail');

var exports = {};

function getQuotedMessage(email) {
    var sel = window.getSelection();
    if (!sel.rangeCount) {
        return email.message;
    }

    if (sel && sel.toString()) {
        var ran = sel.getRangeAt(0);
        var df = ran.cloneContents();
        var wrap = document.createElement('div');
        wrap.appendChild(df);
        return wrap.innerHTML;
    } else {
        return email.message
    }
}

exports.reply = function(email, view) {
    var subject = email.subject;
    var message = '<br>' +
        'On ' + email.date + ', &lt;' + email.from.address + '&gt; wrote:' +
        '<blockquote>\n' + getQuotedMessage(email) + '\n</blockquote>';
    var to = [ email.from ];
    var cc = [];
    u.each(email.to || [], function(item){
        cc.push(item);
    });
    u.each(email.cc || [], function(item){
        cc.push(item);
    });
    if (!/^(RE|回复|答复)[:：]/i.test(email.subject)) {
        subject = '回复: ' + subject;
    }

    util.composeMail(view, '回复邮件', {
        to: to,
        cc: cc,
        uidl: email.uidl,
        subject: subject,
        message: message
    });
};

exports.replyAll = function(email, view) {
    var subject = email.subject;
    var message = '<br>' +
        'On ' + email.date + ', &lt;' + email.from.address + '&gt; wrote:' +
        '<blockquote>\n' + getQuotedMessage(email) + '\n</blockquote>';
    var to = [ email.from ];
    var cc = [];
    u.each(email.to || [], function(item){
        to.push(item);
    });
    u.each(email.cc || [], function(item){
        cc.push(item);
    });
    if (!/^(RE|回复|答复)[:：]/i.test(email.subject)) {
        subject = '回复: ' + subject;
    }

    util.composeMail(view, '回复邮件', {
        to: to,
        cc: cc,
        uidl: email.uidl,
        subject: subject,
        message: message
    });
};

exports.forward = function(email, view) {
    var subject = email.subject;
    var message = '<br>' +
        '---------- Forwarded message ----------<br>\n' +
        'From: &lt;' + email.from.address + '&gt;<br>\n' +
        'To: ' + encoding.dumpAddress(email.to) + '<br>\n' +
        'Subject: ' + subject + '<br>\n' +
        'Date: ' + email.date + '<br>\n' +
        '\n' + getQuotedMessage(email) + '';

    if (!/^(Fwd|转发)[:：]/i.test(email.subject)) {
        subject = '转发: ' + subject;
    }


    var attachments = u.map(email.attachments, function(item){
        return {
            title: item.name,
            value: email.uidl + '/att/' + item.name,
            checked: true
        };
    });

    util.composeMail(view, '转发邮件', {
        to: '',
        cc: '',
        uidl: email.uidl,
        subject: subject,
        message: message,
        attachments: attachments
    });
};

exports.handleClickAction = function(view) {
    $('.mail-body a, .list-summary-table a').click(function() {
        var node = this;
        if (/javascript:/.test(node.href)) {
            return;
        }

        if (/^mailto:/.test(node.href)) {
            var name = node.innerText;
            var address = node.title || name;
            util.composeMail(view, null, {
                to: [ {name: name, address: address} ]
            });
            return false;
        }
        else if (node.target !== '_blank') {
            node.target = '_blank';
        }
    });
};

return exports;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
