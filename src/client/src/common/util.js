/**
 * @file ../client/src/common/util.js ~ 2014/08/28 16:00:24
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {
var moment = require('moment');
var lib = require('esui/lib');
var u = require('underscore');
var icalendar = require('third_party/icalendar/bundle');
var URL = require('er/URL');

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
        // {
        //     field: 'id',
        //     width: 60,
        //     stable: true,
        //     title: 'ID',
        //     content: function (item) {
        //         return '<span title="' + item.uidl + '">#' + item.id + '</span>';
        //     }
        // },
        {
            field: 'star',
            width: 30,
            stable: true,
            title: '',
            content: function (item) {
                // <i class="fa fa-star"></i>
                return '<i data-id="' + item.id + '" title="' + item.uidl + '" class="' +
                    (item.is_star ? 'fa fa-star' : 'fa fa-star-o') + '"></i>';
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
                var extra = [];
                if (item.attachments && item.attachments.length) {
                    var tip = u.map(item.attachments, function(x){
                        return x.name + ' (' + x.size + ')';
                    }).join(' ');
                    extra.push('<i class="fa fa-file" title="' + tip + '"></i>');
                }

                if (item.status === 1) {
                    // 邮件发送中
                    extra.push('<i class="fa fa-sign-out" title="正在发送..."></i>');
                } else if(item.status === 3) {
                    // 邮件解析内容失败，格式非法
                    extra.push('<i class="fa fa-exclamation-triangle" title="邮件内容解析失败"></i>')
                }

                var icons = extra.length ? '<div class="x-icons">' + extra.join('') + '</div>' : '';

                var prefix = '';
                if (item.importance) {
                    prefix = '<i>' + item.importance + '</i>';
                }

                var href = linkBuilder(item);
                return prefix + '<a href="' + href + '">' +
                    (item.subject || '(no subject)') + '</a>' + icons;
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
    var label = URL.parse(location.href).getQuery('label');
    return '#/mail/view~id=' + item.id +
        '&uidl=' + item.uidl + (label ? '&label=' + label : '');
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
        select: 'multi',
        noHead: true
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
            var icalx = icalendar.parse_calendar(email.ical_message);
            var icalxEvents = icalx.events();
            if (icalxEvents.length) {
                email.ical_event = icalxEvents[0];
            }
        }
        catch(ex) {
        }
    } else {
        // FIXME(user) 修复了 http://gitlab.baidu.com/baidu/email/issues/20 之后应该就不需要了
        email.message = email.message.replace(/聽/g, '');
    }

    // FIXME(user) 修复查看附件url的地址
    u.each(email.attachments, function(item) {
        item.preview_url = item.preview_url || 'http://pan.baidu.com/disk/home#path=%252Fapps%252Fdropbox%252Fbaidu.com%252Fliyubei%252F' + email.uidl;
    });

    return email;
};

return exports;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
