define('common/util', ['require'], function (require) {
    var exports = {};
    exports.composeMail = function (view, opt_title, opt_actionOptions) {
        view.waitActionDialog({
            title: opt_title || '\u64B0\u5199\u90AE\u4EF6',
            width: 740,
            needFoot: true,
            url: '/mail/compose',
            actionOptions: opt_actionOptions || {}
        }).then(function (event) {
            var dialog = event.target;
            var action = dialog.getAction();
            action.redirectAfterSubmit = function (result) {
                dialog.dispose();
            };
            var btnOk = dialog.getChild('foot').getChild('btnOk');
            var btnCancel = dialog.getChild('foot').getChild('btnCancel');
            btnOk.on('click', function () {
                action.submitEdit();
            });
            btnCancel.on('click', function () {
                dialog.dispose();
            });
            setTimeout(function () {
                dialog.resize();
            }, 0);
        });
    };
    return exports;
});