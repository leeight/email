/**
 * @file ../client/src/common/util.js ~ 2014/08/28 16:00:24
 * @author leeight(liyubei@baidu.com)
 **/
define(function(require) {

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

return exports;
});










/* vim: set ts=4 sw=4 sts=4 tw=120: */
