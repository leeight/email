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
        var view = this.view;
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

    require('er/util').inherits(ThreadView, BaseAction);
    return ThreadView;
});
