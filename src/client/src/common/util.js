/**
 * @file ../client/src/common/util.js ~ 2014/08/28 16:00:24
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {
var moment = require('moment');
var lib = require('esui/lib');
var u = require('underscore');
var ical = require('common/ical');

var exports = {};

/**
 * @param {BaseView} view ListView或者FormView之类的东东.
 * @param {string=} opt_title 对话框的标题.
 * @param {Object=} opt_actionOptions Child Action所需要的参数.
 */
exports.composeMail = function(view, opt_title, opt_actionOptions) {
    view.waitActionDialog({
        title: opt_title || '撰写邮件',
        width: 740,
        // height: 480,
        // height: 'auto',
        needFoot: true,
        url: '/mail/compose',
        actionOptions: opt_actionOptions || {}
    }).then(function(event) {
        var dialog = event.target;
        var action = dialog.getAction();

        // 提交成功之后的回调函数
        // bat-ria的FormAction里面定义了这个函数
        // 默认的逻辑是调用 this.back, 这个逻辑在原型链上面定义的，
        // 这里我们直接改写了
        action.redirectAfterSubmit = function(result) {
            dialog.dispose();
        };

        var btnOk = dialog.getChild('foot').getChild('btnOk');
        var btnCancel = dialog.getChild('foot').getChild('btnCancel');

        btnOk.on('click', function() {
            action.submitEdit();
        });
        btnCancel.on('click', function() {
            dialog.dispose();
        });
        setTimeout(function() {
            dialog.resize();
        }, 0);
    });
};


function getTableFields(linkBuilder) {
    var tableFields = [
        {
            field: 'id',
            width: 60,
            stable: true,
            title: 'ID',
            content: function (item) {
                return '<span title="' + item.uidl + '">#' + item.id + '</span>';
            }
        },
        {
            field: 'from',
            width: 120,
            stable: true,
            title: '发件人',
            content: function (item) {
                var from = item.from || {
                    name: '未知来源',
                    address: '未知来源'
                };
                var size = item.mail_count || 1;
                return '<span title="' + from.address + '">' +
                    lib.encodeHTML(from.name || from.address) +
                    ((size > 1) ? ' (' + size + ')' : '') +
                '</span>';
            }
        },
        {
            field: 'subject',
            title: '标题',
            content: function (item) {
                var extra = '';
                if (item.attachments && item.attachments.length) {
                    extra = '<span class="x-icon-attchments" title="' +
                    u.map(item.attachments, function(x){
                        return x.name + ' (' + x.size + ')';
                    }).join(' ') + '"></span>';
                }

                var prefix = '';
                if (item.importance) {
                    prefix = '<i>' + item.importance + '</i>';
                }

                var href = linkBuilder(item);
                return prefix + '<a href="' + href + '">' +
                    (item.subject || '(no subject)') + '</a>' + extra;
            }
        },
        {
            field: 'date',
            width: 150,
            stable: true,
            title: '发送日期',
            content: function(item) {
                // return moment(item.date).format('YYYY-MM-DD HH:mm:ss')
                return moment(item.date).fromNow()
            }
        }
    ];

    return tableFields;
}

var tableRows = {
    getRowClass: function(item, index) {
        if (!item.is_read) {
            return 'row-unread';
        }
    }
}

function defaultLinkBuilder(item) {
    return '#/mail/view~id=' + item.id + '&uidl=' + item.uidl;
}

/**
 * 列表页面的配置信息
 * @param {function(item):string} opt_linkBuilder 构造标题的链接
 * @return {Object}
 */
exports.mailListConfiguration = function(opt_linkBuilder) {
    var linkBuilder = opt_linkBuilder || defaultLinkBuilder;
    return {
        fields: getTableFields(linkBuilder),
        rows: tableRows,
        sortable: false,
        columnResizable: true,
        select: 'multi'
    };
};

exports.applyEMailPath = function(email) {
    var date = moment(email.date)
    email.date = date.format('YYYY-MM-DD HH:mm:ss') + ' (' + date.fromNow() + ')';

    if (!email.from) {
        email.from = {
            name: '未知来源',
            address: '未知来源'
        };
    }

    if (email.is_calendar === 1) {
        try {
            var calendar = ical.parse(email.ical_message);
            email.ical_message = ical.format(calendar);
        }
        catch(ex) {
            email.ical_message = '<pre><b>' + ex.toString() + '</b>\n' + email.ical_message + '</pre>';
        }
    } else {
        // FIXME(user) 修复了 http://gitlab.baidu.com/baidu/email/issues/20 之后应该就不需要了
        email.message = email.message.replace(/聽/g, '');
    }

    // FIXME(user) 修复查看附件url的地址
    u.each(email.attachments, function(item) {
        if (/\.(doc|xls|ppt)x?$/i.test(item.name)) {
            item.preview_url = 'http://' + location.hostname + ':8765/doc/viewer/' +
                email.uidl + '/att/' + encodeURIComponent(item.name);
        }
        else {
            item.preview_url = 'http://' + location.hostname + ':8765/downloads/' +
                email.uidl + '/att/' + encodeURIComponent(item.name);
        }
    });

    return email;
};

return exports;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
