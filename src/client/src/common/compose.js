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

exports.reply = function(email, view) {
    var subject = email.subject;
    var message = '<br>' +
        'On ' + email.date + ', &lt;' + email.from.address + '&gt; wrote:' +
        '<br><blockquote>\n' + email.message + '\n</blockquote>';
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
        '<br><blockquote>\n' + email.message + '\n</blockquote>';
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
        '<br><br>\n' + email.message + '';

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
            var address = node.title;
            var name = node.innerHTML;
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
