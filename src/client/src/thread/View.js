/**
 * @file [Please Input File Description]
 * @author leeight(leeight@gmail.com)
 */

define(function (require) {
    var BaseAction = require('bat-ria/mvc/BaseAction');
    var compose = require('common/compose');

    /**
     * Action构造函数
     *
     * @constructor
     */
    function ThreadView() {
        BaseAction.apply(this, arguments);
    }

    ThreadView.prototype.modelType = require('./ViewModel');
    ThreadView.prototype.viewType = require('./ViewView');

    /**
     * inheritDoc
     *
     * @protected
     * @override
     */
    ThreadView.prototype.initBehavior = function () {
        BaseAction.prototype.initBehavior.apply(this, arguments);

        // 处理邮件正文内部链接的点击行为
        compose.handleClickAction(this.view);

        var model = this.model;
        $('.mail-view .list-summary-table').click(function(evt) {
            if (evt.target.nodeName === 'A') {
                return;
            }

            var mail = $(this).parents('.mail-view');
            if (mail.hasClass('mail-view-collapse')) {
                mail.removeClass('mail-view-collapse');

                // 初始化内容
                var data = model.getEMailById(mail.data('id'));
                if (data) {
                    mail.find('.mail-body').html(data.message);
                }
            } else {
                mail.addClass('mail-view-collapse');
            }
        });
    };

    require('er/util').inherits(ThreadView, BaseAction);
    return ThreadView;
});
