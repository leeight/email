/**
 * @file ../client/src/common/util.js ~ 2014/08/28 16:00:24
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {
var moment = require('moment');
var lib = require('esui/lib');
var u = require('underscore');

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



var tableFields = [
    {
        field: 'id',
        width: 10,
        title: 'ID',
        content: function (item) {
            return '<span title="' + item.uidl + '">#' + item.id + '</span>';
        }
    },
    {
        field: 'from',
        width: 100,
        title: '发件人',
        content: function (item) {
            var from = item.from || {
                name: '未知来源',
                address: '未知来源'
            };
            return '<span title="' + from.address + '">' +
                lib.encodeHTML(from.name || from.address) +
            '</span>';
        }
    },
    {
        field: 'subject',
        title: '标题',
        width: 700,
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

            return prefix + '<a href="#/mail/view~id=' + item.id + '&uidl=' + item.uidl + '">' +
                (item.subject || '(no subject)') + '</a>' + extra;
        }
    },
    {
        field: 'date',
        width: 100,
        title: '发送日期',
        content: function(item) {
            return moment(item.date).format('YYYY-MM-DD HH:mm:ss')
        }
    }
];

var tableRows = {
    getRowClass: function(item, index) {
        if (!item.is_read) {
            return 'row-unread';
        }
    }
}

/**
 * 列表页面的配置信息
 * @return {Object}
 */
exports.mailListConfiguration = function() {
    return {
        fields: tableFields,
        rows: tableRows,
        sortable: false,
        columnResizable: true,
        select: 'multi'
    };
};

return exports;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
